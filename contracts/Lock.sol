// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract WinnerToken is ERC20, Ownable, ReentrancyGuard {
    
    // Token configuration
    uint256 public constant MAX_SUPPLY = 10000000 * 10**18; // 10 million tokens
    
    // Conversion rate (tokens per USDT) - set by owner based on Binance balance
    uint256 public conversionRate = 100; // Default: 1 USDT = 100 WT
    
    // SIMPLIFIED: Users can register themselves directly (no wallet generation)
    mapping(address => bool) public isRegisteredUser; // user -> is registered
    
    // Token request system (for deposits)
    struct TokenRequest {
        address userWallet;
        uint256 usdtAmount;
        uint256 tokenAmount;
        uint256 timestamp;
        bool isActive;
    }
    
    mapping(uint256 => TokenRequest) public tokenRequests;
    mapping(address => uint256[]) public userTokenRequests; // user wallet -> request IDs
    uint256 public nextTokenRequestId = 1;
    
    // Withdrawal request system
    struct WithdrawalRequest {
        address userWallet;
        uint256 amount;
        uint256 timestamp;
        bool isActive;
    }
    
    mapping(uint256 => WithdrawalRequest) public withdrawalRequests;
    mapping(address => uint256[]) public userWithdrawalRequests; // user wallet -> request IDs
    uint256 public nextRequestId = 1;
    
    // Events
    event UserRegistered(address indexed user);
    event TokensDeposited(address indexed wallet, uint256 amount);
    event TokenRequested(address indexed wallet, uint256 indexed requestId, uint256 usdtAmount, uint256 tokenAmount);
    event TokenRequestConfirmed(address indexed wallet, uint256 indexed requestId, uint256 tokenAmount);
    event TokenRequestRejected(address indexed wallet, uint256 indexed requestId, uint256 usdtAmount);
    event TokenRequestCancelled(address indexed wallet, uint256 indexed requestId, uint256 usdtAmount);
    event WithdrawalRequested(address indexed wallet, uint256 indexed requestId, uint256 amount);
    event WithdrawalConfirmed(address indexed wallet, uint256 indexed requestId, uint256 amount);
    event WithdrawalRejected(address indexed wallet, uint256 indexed requestId, uint256 amount);
    event WithdrawalCancelled(address indexed wallet, uint256 indexed requestId, uint256 amount);
    event TokensWithdrawn(address indexed wallet, uint256 amount);
    event ConversionRateUpdated(uint256 newRate);
    
    constructor() ERC20("WINNER Token", "WT") Ownable(msg.sender) {
        // Mint initial supply to owner (main wallet)
        _mint(msg.sender, MAX_SUPPLY);
    }
    
    // User registers themselves (using their own wallet address with private key)
    function registerUser() external {
        require(!isRegisteredUser[msg.sender], "User already registered");
        
        isRegisteredUser[msg.sender] = true;
        
        emit UserRegistered(msg.sender);
    }
    
    // Check if user is registered
    function isUserRegistered(address user) external view returns (bool) {
        return isRegisteredUser[user];
    }
    
    // User requests tokens (after depositing USDT off-chain)
    // NOW WORKS: User calls from their own address (they have the private key)
    function requestTokens(uint256 usdtAmount) external nonReentrant {
        require(isRegisteredUser[msg.sender], "User not registered");
        require(usdtAmount > 0, "USDT amount must be greater than 0");
        
        // Calculate token amount based on current conversion rate
        uint256 tokenAmount = usdtAmount * conversionRate;
        
        // Create token request
        uint256 requestId = nextTokenRequestId++;
        tokenRequests[requestId] = TokenRequest({
            userWallet: msg.sender,
            usdtAmount: usdtAmount,
            tokenAmount: tokenAmount,
            timestamp: block.timestamp,
            isActive: true
        });
        
        userTokenRequests[msg.sender].push(requestId);
        
        emit TokenRequested(msg.sender, requestId, usdtAmount, tokenAmount);
    }
    
    // Owner confirms token request (after verifying USDT deposit)
    function confirmTokenRequest(uint256 requestId) external onlyOwner nonReentrant {
        TokenRequest storage request = tokenRequests[requestId];
        require(request.isActive, "Request not active");
        require(request.tokenAmount > 0, "Invalid request");
        require(balanceOf(owner()) >= request.tokenAmount, "Insufficient balance in main wallet");
        
        // Transfer tokens from owner to user wallet
        _transfer(owner(), request.userWallet, request.tokenAmount);
        
        // Mark request as completed
        request.isActive = false;
        
        emit TokenRequestConfirmed(request.userWallet, requestId, request.tokenAmount);
        emit TokensDeposited(request.userWallet, request.tokenAmount);
    }
    
    // Owner rejects token request
    function rejectTokenRequest(uint256 requestId) external onlyOwner {
        TokenRequest storage request = tokenRequests[requestId];
        require(request.isActive, "Request not active");
        require(request.usdtAmount > 0, "Invalid request");
        
        // Mark request as completed
        request.isActive = false;
        
        emit TokenRequestRejected(request.userWallet, requestId, request.usdtAmount);
    }
    
    // Owner cancels token request
    function cancelTokenRequest(uint256 requestId) external onlyOwner {
        TokenRequest storage request = tokenRequests[requestId];
        require(request.isActive, "Request not active");
        require(request.usdtAmount > 0, "Invalid request");
        
        // Mark request as completed
        request.isActive = false;
        
        emit TokenRequestCancelled(request.userWallet, requestId, request.usdtAmount);
    }
    
    // Owner deposits tokens to user wallet (manual deposit - legacy function)
    function depositTokens(address userWallet, uint256 amount) external onlyOwner nonReentrant {
        require(isRegisteredUser[userWallet], "User not registered");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(owner()) >= amount, "Insufficient balance in main wallet");
        
        _transfer(owner(), userWallet, amount);
        emit TokensDeposited(userWallet, amount);
    }
    
    // User requests withdrawal (tokens go on hold)
    function requestWithdrawal(uint256 amount) external nonReentrant {
        require(isRegisteredUser[msg.sender], "User not registered");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Transfer tokens to contract (hold them)
        _transfer(msg.sender, address(this), amount);
        
        // Create withdrawal request
        uint256 requestId = nextRequestId++;
        withdrawalRequests[requestId] = WithdrawalRequest({
            userWallet: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            isActive: true
        });
        
        userWithdrawalRequests[msg.sender].push(requestId);
        
        emit WithdrawalRequested(msg.sender, requestId, amount);
    }
    
    // Owner confirms withdrawal request
    function confirmWithdrawal(uint256 requestId) external onlyOwner {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        require(request.isActive, "Request not active");
        require(request.amount > 0, "Invalid request");
        
        // Transfer tokens from contract to owner
        _transfer(address(this), owner(), request.amount);
        
        // Mark request as completed
        request.isActive = false;
        
        emit WithdrawalConfirmed(request.userWallet, requestId, request.amount);
        emit TokensWithdrawn(request.userWallet, request.amount);
    }
    
    // Owner rejects withdrawal request (return tokens to user)
    function rejectWithdrawal(uint256 requestId) external onlyOwner {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        require(request.isActive, "Request not active");
        require(request.amount > 0, "Invalid request");
        
        // Return tokens to user wallet
        _transfer(address(this), request.userWallet, request.amount);
        
        // Mark request as completed
        request.isActive = false;
        
        emit WithdrawalRejected(request.userWallet, requestId, request.amount);
    }
    
    // Owner cancels withdrawal request (return tokens to user)
    function cancelWithdrawal(uint256 requestId) external onlyOwner nonReentrant {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        require(request.isActive, "Request not active");
        require(request.amount > 0, "Invalid request");
        
        // Return tokens to user wallet
        _transfer(address(this), request.userWallet, request.amount);
        
        // Mark request as completed
        request.isActive = false;
        
        emit WithdrawalCancelled(request.userWallet, requestId, request.amount);
    }
    
    // Owner sets conversion rate based on Binance balance
    function setConversionRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Rate must be greater than 0");
        conversionRate = newRate;
        emit ConversionRateUpdated(newRate);
    }
    
    // Calculate tokens for USDT amount
    function calculateTokensForUSDT(uint256 usdtAmount) external view returns (uint256) {
        return usdtAmount * conversionRate;
    }
    
    // Calculate USDT value for tokens
    function calculateUSDTForTokens(uint256 tokenAmount) external view returns (uint256) {
        return tokenAmount / conversionRate;
    }
    
    // Get total tokens distributed to users (for rate calculation)
    function getTokensInCirculation() external view returns (uint256) {
        return MAX_SUPPLY - balanceOf(owner());
    }
    
    // Override transfer to restrict user-to-user transfers
    function transfer(address to, uint256 amount) public override returns (bool) {
        address sender = msg.sender;
        
        // Allow transfers from/to owner (main wallet)
        if (sender == owner() || to == owner()) {
            return super.transfer(to, amount);
        }
        
        // Allow transfers to contract (for withdrawals)
        if (to == address(this)) {
            return super.transfer(to, amount);
        }
        
        // Block user-to-user transfers
        if (isRegisteredUser[sender] && isRegisteredUser[to]) {
            revert("Direct user-to-user transfers not allowed");
        }
        
        // Allow other transfers
        return super.transfer(to, amount);
    }
    
    // Override transferFrom to restrict user-to-user transfers
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        // Allow transfers from/to owner (main wallet)
        if (from == owner() || to == owner()) {
            return super.transferFrom(from, to, amount);
        }
        
        // Allow transfers to contract (for withdrawals)
        if (to == address(this)) {
            return super.transferFrom(from, to, amount);
        }
        
        // Block user-to-user transfers
        if (isRegisteredUser[from] && isRegisteredUser[to]) {
            revert("Direct user-to-user transfers not allowed");
        }
        
        // Allow other transfers
        return super.transferFrom(from, to, amount);
    }
    
    // Emergency function to recover tokens (owner only)
    function emergencyWithdraw(address userWallet, uint256 amount) external onlyOwner {
        require(isRegisteredUser[userWallet], "User not registered");
        _transfer(userWallet, owner(), amount);
    }
    
    // Get user's token requests
    function getUserTokenRequests(address userWallet) external view returns (uint256[] memory) {
        return userTokenRequests[userWallet];
    }
    
    // Get token request details
    function getTokenRequest(uint256 requestId) external view returns (
        address userWallet,
        uint256 usdtAmount,
        uint256 tokenAmount,
        uint256 timestamp,
        bool isActive
    ) {
        TokenRequest memory request = tokenRequests[requestId];
        return (request.userWallet, request.usdtAmount, request.tokenAmount, request.timestamp, request.isActive);
    }
    
    // Get all pending token requests (for owner dashboard)
    function getAllPendingTokenRequests() external view returns (uint256[] memory) {
        uint256[] memory pending = new uint256[](nextTokenRequestId - 1);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextTokenRequestId; i++) {
            if (tokenRequests[i].isActive) {
                pending[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = pending[i];
        }
        
        return result;
    }
    
    // Get user's withdrawal requests
    function getUserWithdrawalRequests(address userWallet) external view returns (uint256[] memory) {
        return userWithdrawalRequests[userWallet];
    }
    
    // Get withdrawal request details
    function getWithdrawalRequest(uint256 requestId) external view returns (
        address userWallet,
        uint256 amount,
        uint256 timestamp,
        bool isActive
    ) {
        WithdrawalRequest memory request = withdrawalRequests[requestId];
        return (request.userWallet, request.amount, request.timestamp, request.isActive);
    }
    
    // Get all pending withdrawal requests (for owner dashboard)
    function getAllPendingWithdrawals() external view returns (uint256[] memory) {
        uint256[] memory pending = new uint256[](nextRequestId - 1);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextRequestId; i++) {
            if (withdrawalRequests[i].isActive) {
                pending[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = pending[i];
        }
        
        return result;
    }
}