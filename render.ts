import {GridInterface, ResponsiveGrid} from "./mazeGridComponent.js"
export const globalCancelToken = {
	cancelled: false,
	allTimeouts: new Set<number>(),
	cancelAll: function () {
	  this.cancelled = true;
	  for(let timeoutID of this.allTimeouts){
		clearTimeout(timeoutID);
	  }
	},
	reset: function () {
		this.cancelAll();
		this.cancelled = false;
	}
};

//originally https://stackoverflow.com/a/53452241/11844784
//for a cancellable version I basically built https://stackoverflow.com/a/25345746 
// (from https://stackoverflow.com/questions/25345701/how-to-cancel-timeout-inside-of-javascript-promise), the 2014 solution
// the 2021 solution supposedly uses a built in AbortController 
// (which AFAIK has the advantage that it works on any function built on promises, including built in fetch - so is a way to cancel fetch)
//But here, I believe this clearInterval / clearTimeout is adequate (btw fun fact, the clearInterval / clearTimeout are interchangeable (src MDN))
function wait(ms: number | string) {
	ms = Number(ms);
	if(ms > 0){
		return new Promise((resolve, reject) => {
			const timeoutID = setTimeout(() => {
				globalCancelToken.allTimeouts.delete(timeoutID);
				if (!globalCancelToken.cancelled) {
					resolve(ms)
				}
			}, ms );
			globalCancelToken.allTimeouts.add(timeoutID);
		})
	}else{
		return;
	}
}

let animationDelay = document.getElementById("visualisationDelayPicker") as HTMLInputElement;
let statusParagraph = document.querySelector(".presentResult") as HTMLParagraphElement;

class Knapsack{
	//the maximum allowed weight of items we can put in the bag
	knapsackWeight: number
	//We want to maximize profit by choosing which items to put in the bag, staying at the specified weight
	//For each i-th item in itemWeights, the price is the i-th item in itemPrices
	itemWeights: number[]
	itemPrices: number[]
	numberOfItems: number
	grid: ResponsiveGrid
	dpTable: number[][]
	constructor(knapsackWeight: number, itemWeights: number[], itemPrices: number[]){
		if(itemWeights.length != itemPrices.length){
			throw Error("For each item item there must be a price and a weight. (Lengths of prices and weights lists do not match)");
		}
		//remove the old grid from DOM (for the previously selected maze) (until now it was simply hidden
		document.querySelector("responsive-grid")?.remove();
		let grid = document.createElement("responsive-grid");
		grid.columns = knapsackWeight + 2;
		grid.rows = itemWeights.length + 2;
		grid.cellStyles = "./visualisation.css";
		document.querySelector("main")!.appendChild(grid);

		this.grid = grid;
		this.knapsackWeight = knapsackWeight;
		this.itemPrices = itemPrices;
		this.itemWeights = itemWeights;
		this.numberOfItems = itemWeights.length;
		//Zero based 2D array, table for storing results
		//The **main content** (not the headings) of the visual grid is essentially 1 based
		this.dpTable = Array.from(Array(this.numberOfItems + 1), () => new Array(this.knapsackWeight + 1).fill(-1)) 
		this.main();
	}

	//utility function to not forget to add 1 to every coordinate
	//(first row and column are headings)
	setTableText(row: number, column: number, value: number){
		// console.log("set", row, column)
		this.dpTable[row][column] = value;
		this.grid.setTextToCell([row + 1, column + 1], String(value));
	}

	async main(){
		//set the column indexes (as headings)
		for(let x = 0; x <= this.knapsackWeight; x++){
			this.grid.setTextToCell([0,x+1], x);
		}
		//set the row indexes
		for(let x = 0; x <= this.numberOfItems; x++){
			this.grid.setTextToCell([x+1,0], x);
		}

		console.log(this.dpTable)

		console.log("itemPrices", this.itemPrices)
		//0 based so we don't have to think about the table and its headings in indexing
		for(let n = 0; n <= this.numberOfItems; n++){
			let wi = this.itemWeights[n - 1];
			let pi = this.itemPrices[n - 1];
			await wait(animationDelay.value);
			for(let w = 0; w <= this.knapsackWeight; w++){
				await wait(animationDelay.value);
				//Leaf: 
				// no items left (n==0)
				// or no capacity to take any more (w==0)
				if(n == 0 || w == 0){
					this.setTableText(n ,w, 0);
				}
				//Enough capacity to consider taking this weight
				else if(wi <= w){
					let bestOptionFromSubtree = Math.max(
						pi + this.dpTable[n-1][w - wi], //take the item
						this.dpTable[n-1][w]			//not take the item
					);
					console.log(bestOptionFromSubtree, "for",`Node: W=${w}, P=[${this.itemPrices.slice(0,n)}], Wt=[${this.itemWeights.slice(0, n)}]`);
					this.setTableText(n, w, bestOptionFromSubtree);
				}
				else{
					//Not enough capacity to consider taking the weight
					console.log(this.dpTable[n-1][w], "for",`Node: W=${w}, P=[${this.itemPrices.slice(0,n)}], Wt=[${this.itemWeights.slice(0, n)}]`)
					this.setTableText(n, w, this.dpTable[n-1][w]);
				}
				document.querySelector(".status")!.textContent = `Node: W=${w}, P=[${this.itemPrices.slice(0,n)}], Wt=[${this.itemWeights.slice(0, n)}]`;
			}
		}
	}
}

export {Knapsack};