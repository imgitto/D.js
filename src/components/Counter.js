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