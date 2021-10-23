# D.js
D.js is javascript library to create views.
<br>
Have a look at sample code in src folder.
<br>

<h4>Create Counter Component : (Counter.js)</h4>

Object with state to handle stateful data, data for static data, action, lifecycle, render

```jsx
export default D.component({
  state:({props})=>{
    return {
      counter:props.initialValue
    }
  },
  data:({props,state}) => {
    return {
      renderCount:0
    }
  },
  action:({props,state})=>{
    return {
      increment:()=>{
        state.counter+=props.value;
      }
    }
  },
  render:({props,state,data,action})=>{
    return (
      <div>
        <h2>Counter: {state.counter}</h2>
        <h4>Rendered: {data.renderCount}</h4>
        <button on-click={action.increment}>Increment me</button>
      </div>
    );
  },
  lifecycle:({data})=>{
    return {
      beforeUpdate:()=>{
        console.log({data});
        data.renderCount += 1;
      }
    }
  }
}); 
```


<h4>Create App</h4>

```jsx
import Counter from "./Counter.js";

function render(){
return (
		<div className="app">
			<Counter/>
		</div>
	);
}

D.createApp({render}).mount("#app");
```

<h2>Default Components</h2>

<h4>Example for D.ForEach and D.If</h4>

```jsx
function state({props}){
	return {
		search:"",
		game:"",
		games:["cricket","football","basketball","tennis","vollyball","hockey","badminton"]
	}
}

function data(){
	return {
		renderCount:0
	}
}

function action({props,state}){
	return {
    setGame:(val)=>{
      state.game = val;
    },
    setSearch:(val)=>{
      state.search = val;
    }
  }
}

function render({props,data,state,action}){
	return (
		<div className="games">
			<ul>
				<D.ForEach on={state.games}>
					{(value,index)=>(
						<D.If is={value.includes(state.search)}>
								<D.If is={state.search.length % 2 === 0}>
									<li>{value}</li>
								</D.If>
								<D.If is={state.search.length % 2 === 1}>
									<li><b>{value}</b></li>
								</D.If>
						</D.If>
					)}
				</D.ForEach>
      </ul>
      <input type="text" on-keyup={(e)=>action.setSearch(e.target.value)} value={state.search}/>
		</div>
	);
}

function lifecycle({data}){
	return {
		beforeUpdate:()=>{
			data.renderCount+=1;
		}
	}
}

export default D.component({
	state,
	data,
	action,
	render,
	lifecycle
});
```


<h4>Example for D.Switch and D.Case</h4>

```jsx
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
			<button on-click={action.incrementC}>Increment</button>
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
```


