// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.3/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

//for BNB-Chain x tern.crypto contest
contract flipFlop is ReentrancyGuard{
    mapping (address => uint) public playerBalances;
    
    event Received(address, uint);

    event GetRes(address player, uint256 amount, uint option, uint result, uint optioncomp); 
    
    //give the contract something to bet with
    function fundContract() external payable {
        emit Received(msg.sender, msg.value);
    }
    
    //deposit a player's funds
    function deposit() external payable {
        playerBalances[msg.sender] += msg.value;
    }
    
    //withdraw a player's funds
    function withdraw() external nonReentrant {
        uint playerBalance = playerBalances[msg.sender];
        require(playerBalance > 0);
        
        playerBalances[msg.sender] = 0;
        (bool success, ) = address(msg.sender).call{ value: playerBalance }("");
        require(success, "withdraw failed to send");
    }
    
    function getContractBalance() external view returns(uint contractBalance) {
        return address(this).balance;
    }

    function random() public view returns(uint){
        return uint(keccak256(abi.encodePacked(block.timestamp,block.difficulty,  
        msg.sender))) % 3 + 1;
    }
    
    function playGame(uint _playerOneChoice, uint _gameStake) external returns(uint gameOutcome) {
        require(playerBalances[msg.sender] >= _gameStake * (1 wei), "Not enough funds to place bet - please deposit more Ether.");
        
        uint _playerTwoChoice = random();
        bytes memory b = bytes.concat(bytes(Strings.toString(_playerOneChoice)), bytes(Strings.toString(_playerTwoChoice)));
        
        uint rslt;
        
        if(keccak256(b) == keccak256(bytes("11"))
            || keccak256(b) == keccak256(bytes("22"))
            || keccak256(b) == keccak256(bytes("33")))
        {
            //this is a draw
            rslt = 0;
        } else if(keccak256(b) == keccak256(bytes("32"))
            || keccak256(b) == keccak256(bytes("13"))
            || keccak256(b) == keccak256(bytes("21")))
        {
            //player 1 wins
            playerBalances[msg.sender] += _gameStake * 2 * (1 wei);
            rslt = 1;
        } else if(keccak256(b) == keccak256(bytes("23"))
            || keccak256(b) == keccak256(bytes("31"))
            || keccak256(b) == keccak256(bytes("12")))
        {
            //player 2 wins (the contract wins)
            playerBalances[msg.sender] -= _gameStake * (1 wei);
            rslt = 2;
        }
        else {
            //there was a problem with this game...
            rslt = 3;
        }

        emit GetRes(msg.sender, _gameStake, _playerOneChoice, rslt, _playerTwoChoice);

        return rslt;
        
    }
}