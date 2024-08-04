// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenLock is Ownable {
  ERC20 public immutable TOKEN;
  address public immutable BENEFICIARY;
  Lock[] public locks;

  error ReleaseTimeInPast();
  error ZeroAmountNotAllowed();
  error TokenTrasferFailed();
  error NoTokenToRelease();
  error NoTokenToRevoke();
  error IndexOutOfBound();

  event TokenLocked(uint256 amount, uint256 releaseTime);
  event TokenReleased(address indexed beneficiary, uint256 amount);
  event TokenLockRevoked(uint256 index, uint256 amount);
  event AllTokenLocksRevoked(uint256 amount);

  // solhint-disable-next-line func-visibility
  constructor(
    address _token,
    address _owner,
    address _beneficiary
  ) Ownable(_owner) {
    TOKEN = ERC20(_token);
    BENEFICIARY = _beneficiary;
  }

  function getOwner() public view returns (address) {
    return owner();
  }

  function getToken() public view returns (address) {
    return address(TOKEN);
  }

  function getBeneficiary() public view returns (address) {
    return BENEFICIARY;
  }

  function lock(uint256 amount, uint256 releaseTime) external onlyOwner {
    if (releaseTime <= block.timestamp) {
      revert ReleaseTimeInPast();
    }

    if (amount == 0) {
      revert ZeroAmountNotAllowed();
    }

    if (!TOKEN.transferFrom(msg.sender, address(this), amount)) {
      revert TokenTrasferFailed();
    }

    locks.push(Lock(amount, releaseTime));

    emit TokenLocked(amount, releaseTime);
  }

  function release() external onlyOwner {
    uint256 totalReleasedAmount = 0;

    for (uint256 i = 0; i < locks.length; i++) {
      if (block.timestamp >= locks[i].releaseTime && locks[i].amount > 0) {
        totalReleasedAmount += locks[i].amount;
        locks[i].amount = 0;
      }
    }

    if (totalReleasedAmount == 0) {
      revert NoTokenToRelease();
    }

    if (!TOKEN.transfer(BENEFICIARY, totalReleasedAmount)) {
      revert TokenTrasferFailed();
    }

    emit TokenReleased(BENEFICIARY, totalReleasedAmount);
  }

  function revokeLock(uint256 index) external onlyOwner {
    if (index >= locks.length) {
      revert IndexOutOfBound();
    }

    if (locks[index].amount == 0) {
      revert NoTokenToRevoke();
    }

    uint256 amount = locks[index].amount;
    locks[index].amount = 0;

    if (!TOKEN.transfer(msg.sender, amount)) {
      revert TokenTrasferFailed();
    }

    emit TokenLockRevoked(index, amount);
  }

  function revokeAllLocks() external onlyOwner {
    uint256 totalCancelled = 0;

    for (uint256 i = 0; i < locks.length; i++) {
      if (locks[i].amount > 0) {
        totalCancelled += locks[i].amount;
        locks[i].amount = 0;
      }
    }

    if (totalCancelled == 0) {
      revert NoTokenToRevoke();
    }

    if (!TOKEN.transfer(msg.sender, totalCancelled)) {
      revert TokenTrasferFailed();
    }

    emit AllTokenLocksRevoked(totalCancelled);
  }

  function getLockedIndices() external view returns (uint256[] memory) {
    Lock[] memory _locks = locks;
    uint256 activeLocksCount = 0;

    for (uint256 i = 0; i < _locks.length; i++) {
      if (_locks[i].amount > 0) {
        activeLocksCount += 1;
      }
    }

    uint256[] memory indices = new uint256[](activeLocksCount);
    uint256 j = 0;
    for (uint256 i = 0; i < _locks.length; i++) {
      if (_locks[i].amount > 0) {
        indices[j] = i;
        j++;
      }
    }

    return indices;
  }

  function getLocks() external view returns (Lock[] memory) {
    return locks;
  }

  struct Lock {
    uint256 amount;
    uint256 releaseTime;
  }
}
