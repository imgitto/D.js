# D.js
D.js is javascript library to create views.
<br>
Have a look at sample code in src folder.
<br>
<h4>Create App</h4>

```jsx
import App from "./App.js";

function render(){
	return (
		<div className="app">
			<App/>
		</div>
	);
}

D.createApp({render}).mount("#app");
```
