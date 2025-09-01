export const CONTRACT_ABI = [
  "function registerUser() external",
  "function isUserRegistered(address user) external view returns (bool)",
  "function requestTokens(uint256 usdtAmount) external",
  "function confirmTokenRequest(uint256 requestId) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function requestWithdrawal(uint256 amount) external",
  "function confirmWithdrawal(uint256 requestId) external",
  "function getAllPendingTokenRequests() external view returns (uint256[] memory)",
  "function getAllPendingWithdrawals() external view returns (uint256[] memory)",
  "function getTokenRequest(uint256 requestId) external view returns (address, uint256, uint256, uint256, bool)",
  "function getWithdrawalRequest(uint256 requestId) external view returns (address, uint256, uint256, bool)",
  "function conversionRate() external view returns (uint256)"
];