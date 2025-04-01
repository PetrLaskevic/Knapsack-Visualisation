import {Knapsack, globalCancelToken} from "./render.js";

let mazeAppClassHolderVariable!: Knapsack; //the instance of the maze app
let knapsackWeight = document.getElementById("bag_weight") as HTMLInputElement;
let prices = document.getElementById("prices") as HTMLInputElement;
let weights = document.getElementById("weights") as HTMLInputElement;

function makePopup(heading: string, text: string, id: string){
	//For trusted input only (no input sanitisation here)
	//I use it for exceptions my program generates, and never any user input
	let div = document.createElement("div");
	div.className = "popup";
	//TODO: Add code to actually destroy the popup and not hide it when Ok is pressed
	div.innerHTML = `
	<p class="heading"><b>${heading}</b></p>
	<p>${text}</p>
	<div style="text-align: right;">
	<button id="${id}" class="ok" onclick="this.parentElement.parentElement.classList.add('hidden')">OK</button>
	</div>
	`;
	document.body.appendChild(div);
}

function start(){
	globalCancelToken.reset();
	try{
		if(!prices.validity.valid){
			throw Error("Write prices as a list of positive integers, separated by commas.");
		}
		if(!weights.validity.valid){
			throw Error("Write weights as a list of positive integers, separated by commas.");
		}
		let weightsList = weights.value.split(",").map(Number);
		let pricesList = prices.value.split(",").map(Number);
		mazeAppClassHolderVariable = new Knapsack(Number(knapsackWeight.value), weightsList, pricesList);
	}catch(error){
		console.error(error);
		//Show the user errors thrown by mazeTextToGraph for example
		//This `error as Error` is a TS technicality, since you technically can throw anything, not just Error
		//SMH, I only throw Error and don't have any dependencies which don't
		makePopup((error as Error).message, "", "error");
	}

}
document.getElementById("launch")!.addEventListener("click", start);
console.log("yes");