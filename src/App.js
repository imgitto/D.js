import Counter from "./components/Counter.js";
import List from "./components/List.js";

function state(){
	return {
		c:1
	}
}
function action({state}){
	return {
		incrementC:()=>{
			state.c++;
		}
	}
}
function render({state,action}){
	return(
		<div className="app">
			<h1>Hello {state.c}</h1>
			<hr/>
			<D.If is={state.c%2==0}>
				<div>
					<D.If is={state.c%3 == 0}>
						<h1>Counter increased by 5</h1>
						<p>lorem ipsum</p>	
					</D.If>
					<Counter value={5} initialValue={5} />
				</div>
			</D.If>
			<D.If is={state.c%2==1}>
				<Counter value={10} initialValue={10} />
			</D.If>
			<hr/>
			<List>
				<h1>Inside List</h1>
			</List>
			<button on-click={action.incrementC}>Increment</button>
			<hr/>
				<D.Switch strict={false} value={state.c % 2}>
					<D.Case match={1}>
						<h2>Odd</h2>
					</D.Case>
					<D.Case match={1}>
						<p>Hello</p>
					</D.Case>
					<D.Case match={0}>
						<h2>Even</h2>
					</D.Case>
				</D.Switch>
		</div>
	);
}

function lifecycle({state,action,props}){
	return {
		mount:()=>{console.log("App mounted")}
	}
}

export default D.component({
	state,
	action,
	render,
	lifecycle
});