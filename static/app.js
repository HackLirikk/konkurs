// cache the dom (storing for future use)
// & reset everything to 0 value
let userScore = 0;
let computerScore = 0;
const userScore_span = document.getElementById('user-score');
const computerScore_span = document.getElementById('computer-score');
const scoreBoard_div = document.querySelector('.score-board');
const result_div = document.querySelector('.result');
const rock_div = document.getElementById('rock');
const paper_div = document.getElementById('paper');
const scissors_div = document.getElementById('scissors');


const contractAddress = "0x2188460248A5dEBa55904f9642ccFc27CB62ba22";
const contractABI = [
	{
		"inputs": [],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "fundContract",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "option",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "result",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "optioncomp",
				"type": "uint256"
			}
		],
		"name": "GetRes",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_playerOneChoice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_gameStake",
				"type": "uint256"
			}
		],
		"name": "playGame",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "gameOutcome",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "Received",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContractBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "contractBalance",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "playerBalances",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "random",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]


const provider = new ethers.providers.Web3Provider(window.ethereum, 97)//ChainID 97 BNBtestnet
let signer;
let contract;


const event = "GetRes";

provider.send("eth_requestAccounts", []).then(()=>{
    provider.listAccounts().then( (accounts) => {
        signer = provider.getSigner(accounts[0]); //account in metamask
        
        contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
        )
     
    }
    )
}
)



// similar to convertcase but just takes lowercase and replaces with titlecase
function convertCase(anythingIwant) {
  if (anythingIwant === 'paper') return 'Paper';
  if (anythingIwant === 'scissors') return 'Scissors';
  return 'Rock';
}

// Winning Condition - this handles what happens when the user clicks one of the choices where the value is them passed through as a parameter
function win(user, computer) {
  userScore++;
  // console.log('user score is ' + userScore + ' ' + user);
  userScore_span.innerHTML = userScore;
  const userName = ' (user)'.fontsize(3).sup();
  const compName = ' (comp)'.fontsize(3).sup();
  result_div.innerHTML = `<p>${convertCase(user)}${userName} beats ${convertCase(computer)}${compName}. You win!</p>`;
  const roundStatus = document.getElementById(user);
  roundStatus.classList.add('winningStyles');
  setTimeout(() => roundStatus.classList.remove('winningStyles'), 300);
}

// Losing Condition - this handles what happens when the user clicks one of the choices where the value is them passed through as a parameter
function loses(user, computer) {
  computerScore++;
  // console.log('computer score is ' + computerScore + ' ' + computer);
  computerScore_span.innerHTML = computerScore;
  const userName = ' (user)'.fontsize(3).sup();
  const compName = ' (comp)'.fontsize(3).sup();
  result_div.innerHTML = `<p>${convertCase(computer)}${compName} beats ${convertCase(user)}${userName}. You lose!</p>`;
  const roundStatus = document.getElementById(user);
  roundStatus.classList.add('losingStyles');
  setTimeout(() => roundStatus.classList.remove('losingStyles'), 300);
}

// Draw Condition - this handles what happens when the user clicks one of the choices where the value is them passed through as a parameter
function draw(user, computer) {
	const userName = ' (user)'.fontsize(3).sup();
  const compName = ' (comp)'.fontsize(3).sup();
  result_div.innerHTML = `<p>It was a draw! You both chose ${convertCase(user)}</p>`;
  // "It was a draw! You both chose " + user + " " + computer; // old js
  const roundStatus = document.getElementById(user);
  roundStatus.classList.add('drawStyles');
  setTimeout(() => roundStatus.classList.remove('drawStyles'), 300);
}


async function flipFlop(_playerOneChoice){
  let amountInEth = document.getElementById("stavka").value;
  let amountInWei = ethers.utils.parseEther(amountInEth.toString())
  console.log(amountInWei);
  
  let resultOfCoinFlip = await contract.playGame(_playerOneChoice, amountInWei);
  const res = await resultOfCoinFlip.wait();
  console.log(res);
  //console.log( await res.events[0].args.player.toString());

  let queryResult =  await contract.queryFilter('GetRes', await provider.getBlockNumber() - 1000, await provider.getBlockNumber());
  let queryResultRecent = queryResult[queryResult.length-1]
  //console.log(queryResult[queryResult.length-1].args);

  let amount = await queryResultRecent.args.amount.toString();
  let player = await queryResultRecent.args.player.toString();
  let option = await queryResultRecent.args.option.toString();
  let result = await queryResultRecent.args.result.toString();
  let optioncomp = await queryResultRecent.args.result.toString();


  if (option == 1){
    userChoice = "rock"
  } else if (option == 2){
    userChoice = "paper"
  } else if (option == 3){
    userChoice = "scissors"
  }
  console.log(option);
  console.log(userChoice);
  if (optioncomp == 1){
    computerChoice = "rock"
  } else if (optioncomp == 2){
    computerChoice = "paper"
  } else if (optioncomp == 3){
    computerChoice = "scissors"
  }
  console.log(optioncomp);
  console.log(computerChoice);
  game(userChoice, computerChoice);
}



// The core game functions that set up and determine the games actual logic aka paper beats rock etc
function game(userChoice, computerChoice) {

  // console.log('Game function: user choice is = ' + userChoice);
  // console.log('Game function: computer choice is = ' + computerChoice);

  switch (userChoice + computerChoice) {
    case 'paperrock':
    case 'rockscissors':
    case 'scissorspaper':
      win(userChoice, computerChoice);
      // console.log("user wins");
      break;
    case 'rockpaper':
    case 'scissorsrock':
    case 'paperscissors':
      loses(userChoice, computerChoice);
      // console.log("computer wins");
      break;
    case 'rockrock':
    case 'scissorsscissors':
    case 'paperpaper':
      draw(userChoice, computerChoice);
      // console.log("draw");
      break;
  }
}
// ES5 style of writing this function
// function main() {
//   rock_div.addEventListener('click', function() {
//     game('rock');
//   });

//   paper_div.addEventListener('click', function() {
//     game('paper');
//   });

//   scissors_div.addEventListener('click', function() {
//     game('scissors');
//   });
// }

// ES6 style of writing this function
// This function creates and adds an eventlistener to the rock, paper scissors html element and the passes the value of that element to the game function
function main() {
  rock_div.addEventListener('click', () => flipFlop('1'));
  paper_div.addEventListener('click', () => flipFlop('2'));
  scissors_div.addEventListener('click', () => flipFlop('3'));
}

main();
