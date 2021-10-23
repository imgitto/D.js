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
    },
    addGame:()=>{
      state.games = [...state.games, state.game];
      state.game = "a"; 
      console.log(state.game);
    }
  }
}

function render({props,data,state,action}){
	return (
		<div className="games">
			<h1 style={{
				color:data.renderCount%2 === 0 ? "blue" : "black",
				background:"#ddd"
			}}>{Math.random()}</h1>
			<h4 style={{
				fontSize:"20px"
			}}>Rendered: {data.renderCount}</h4>
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