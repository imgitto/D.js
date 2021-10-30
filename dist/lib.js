const D = {};
(()=>{
	const __internal = {};
	((__internal)=>{
		__internal.componentList = [];

		const CREATE_NODE = Symbol('CREATE_NODE'),
					REMOVE_NODE = Symbol('REMOVE_NODE'),
					REPLACE_NODE = Symbol('REPLACE_NODE'),
					UPDATE_NODE = Symbol('UPDATE_NODE'),
					SET_PROP = Symbol('SET_PROP'),
					REMOVE_PROP = Symbol('REMOVE PROP'),
					UPDATE_LISTENER_PROP = Symbol('UPDATE_LISTENER_PROP'),
					FRAGMENT = Symbol("FRAGMENT_NODE");


		__internal.flatten = (arr) => {
			return [].concat.apply([], arr);
		}

		__internal.isNullOrUndefined = (value) => {
			return value === null || value === undefined;
		}

		__internal.h = (type, props, ...children) => {
			props = props || {};
			children = __internal.flatten(children);

			if(__internal.componentList.includes(type)){
				return type({
					props:props,
					children:children
				});	
			}

			return {
				type,
				props,
				children
			}
		}

		__internal.changed = ({newNode, oldNode}) => {
			return(
				(typeof newNode !== typeof oldNode) ||
				(["string","number","undefined"].includes(typeof newNode) && newNode !== oldNode) ||
				(newNode.type !== oldNode.type)
			);
		}

		__internal.diffProps = ({newNode, oldNode}) => {
			const patches = [];
			const props = Object.assign({}, newNode.props, oldNode.props);
			Object.keys(props).forEach((name) => {
				const newVal = newNode.props[name];
				const oldVal = oldNode.props[name];
				if(__internal.isNullOrUndefined(newVal)) {
					patches.push({
						type: REMOVE_PROP,
						name,
						value: oldVal
					});
				} else if(name.startsWith("on-")){
					patches.push({
						type: UPDATE_LISTENER_PROP,
						name, newValue: newVal,
						oldValue:oldVal
					});
				} else if(name === "style"){
					let diffs = __internal.compareStyles({oldVal,newVal});
					if(diffs !== null){
						patches.push({
							type: SET_PROP,
							name,
							value:diffs
						})
					}
				} else if (__internal.isNullOrUndefined(oldVal) || newVal !== oldVal) {
					patches.push({
						type: SET_PROP, 
						name, value: newVal
					});
				}
			});
			return patches;
		}

		__internal.compareStyles = ({oldVal,newVal}) => {
			if(Object.is(oldVal,newVal)){
				return null;
			}
			let diffs = {};
			Object.keys(newVal).forEach((styleName)=>{
				if(oldVal[styleName] !== newVal[styleName]){
					diffs[styleName] = newVal[styleName];
				}
			});
			return diffs;
		}

		__internal.diffChildren = ({newNode, oldNode}) => {
			const patches = [];
			const patchesLength = Math.max(
				newNode.children.length,
				oldNode.children.length
			);
			for(let i=0;i<patchesLength;i++) {
				patches[i] = __internal.diff({
					newNode:newNode.children[i],
					oldNode:oldNode.children[i]
				});
			}
			return patches;
		}

		__internal.propsChanged = ({newProps,oldProps}) => {
			return !Object.is(newProps,oldProps);	
		}

		__internal.diff = ({newNode, oldNode}) => {
			if(__internal.isNullOrUndefined(oldNode)) {
				return {
					type: CREATE_NODE, 
					newNode
				}
			}
			if(__internal.isNullOrUndefined(newNode)) {
				return {
					type: REMOVE_NODE, 
					oldNode
				}
			}
			if(__internal.changed({newNode, oldNode})) {
				if(oldNode.type === null){
					return {
						type: CREATE_NODE, 
						newNode
					};
				} else if(newNode.type === null){
					return {
						type: REMOVE_NODE, 
						oldNode
					};
				} else {
					return {
						type: REPLACE_NODE, 
						newNode, 
						oldNode
					}
				}
			} else if(typeof newNode.type === "function"){
				if(__internal.propsChanged({
					newProps:newNode.props, 
					oldProps:oldNode.props
				})){
					oldNode._internal.setProps(newNode.props);
				}
				newNode._internal = oldNode._internal;
			} else if(newNode.type === null && oldNode.type === null){
				return null;
			}
			if(newNode.type) {
				return {
					type: UPDATE_NODE,
					isFragment: newNode.type === FRAGMENT,
					props: __internal.diffProps({newNode, oldNode}),
					children: __internal.diffChildren({newNode, oldNode}),
				}
			}
		}

		__internal.createElement = ({node,parent}) => {
			if (["string","number","undefined"].includes(typeof node)) {
				return document.createTextNode(node)
			}
			if(__internal.isNullOrUndefined(node.type)){
				return null;
			}

			if(typeof node.type === "function"){
				if(node.type === D.If || node.type === D.ForEach){
					let childNodes = node.type({
						props:node.props,
						children:node.children,
						parent:parent
					});
					if(Array.isArray(childNodes)){
						childNodes.map((childNode)=>{
							return __internal.createElement({node:childNode,parent});
						})
						.forEach((childNode)=>{
							if(childNode !== null){
								parent.appendChild(childNode);
							}
						});
						return parent;
					} else {
						return __internal.createElement({node:childNodes,parent});
					}
				}
				node._internal = new node.type()(node.props);
				return node._internal.render(parent);
			}

			if(node.type === FRAGMENT){
				return node.children.map((childNode)=>{
					return __internal.createElement({node:childNode,parent});
				})
				return null;
			}

			const el = document.createElement(node.type);
			__internal.setProps({
				target:el,
				props:node.props
			});
			node.children.map((childNode) => {
				return __internal.createElement({
					node:childNode,
					parent:el
				})
			}).forEach((childNodes) => {
				__internal.appendChild({
					target:el,
					childNodes
				});
			})
			return el;
		}

		__internal.appendChild = ({target,childNodes}) => {
			if(Array.isArray(childNodes)){
				childNodes.forEach((childNode)=>{
					if(Array.isArray(childNode)){
						__internal.appendChild({
							target,
							childNodes:childNode
						});
					} else if(__internal.isNullOrUndefined(childNode) === false){
						target.appendChild(childNode);
					}
				});
			} else if(__internal.isNullOrUndefined(childNodes) === false){
				target.appendChild(childNodes);
			}
		}

		__internal.setProp = ({target, name, value}) => { 
			if (name === 'className') {
				return target.setAttribute('class', value)
			} else if(name.startsWith("on-")){
				let eventName = name.split("on-")[1];
				target.addEventListener(eventName,value);
			} else if(name === "value"){
				target.value = value;
			} else if(name === "style"){
				__internal.applyStyles({target,styles:value});
			} else {
				target.setAttribute(name, value)
			}
		}

		__internal.applyStyles = ({target,styles}) => {
			if(typeof styles === "object" && Array.isArray(styles) === false){
				Object.keys(styles).forEach((styleName)=>{
					target.style[styleName] = styles[styleName];
				});
			}
		}

		__internal.setProps = ({target, props}) => {
			Object.keys(props).forEach(name => {
				__internal.setProp({
					target, 
					name, 
					value:props[name]
				});
			});
		}

		__internal.removeProp = ({target, name, value}) => {
			if (name === 'className') {
				return target.removeAttribute('class')
			} else {
				target.removeAttribute(name);
			}
		}

		__internal.updateListener = ({target, name, newValue, oldValue}) => {
			let eventName = name.split("on-")[1];
			target.removeEventListener(eventName,oldValue);
			target.addEventListener(eventName,newValue);
		}

		__internal.patchProps = ({parent, patches}) => {
			for (let i = 0; i < patches.length; i++) {
				const propPatch = patches[i];

				if(propPatch.type  === UPDATE_LISTENER_PROP){
					__internal.updateListener({
						target:parent, 
						name:propPatch.name,
						newValue:propPatch.newValue,
						oldValue:propPatch.oldValue
					});
				}

				const {type, name, value} = propPatch;
				if (type === SET_PROP) {
					__internal.setProp({
						target:parent, 
						name, 
						value
					});
				}
				if (type === REMOVE_PROP) {
					__internal.removeProp({
						parent:target,
						name,
						value
					});
				}
			}
		}



		__internal.patch = ({parent, patches, index, level, adjustIndex, isPrevFragment}) => {
			if (!patches || __internal.isNullOrUndefined(patches)) { return; }

			let el = parent.childNodes[index+adjustIndex[level]];

			switch (patches.type) {
				case CREATE_NODE: {
					const {newNode} = patches;
					const newEl = __internal.createElement({
						node:newNode,
						parent
					});
					return parent.insertBefore(newEl, parent.children[index+adjustIndex[level]]);
				}
				case REMOVE_NODE: {
					if(typeof patches.oldNode.type === "function"){
						patches.oldNode._internal.unmount();
					}
					adjustIndex[level] += -1;
					return parent.removeChild(el);
				}
				case REPLACE_NODE: {
					const {newNode} = patches;
					const newEl = __internal.createElement({
						node:newNode,
						parent
					});
					return parent.replaceChild(newEl, el);
				}
				case UPDATE_NODE: {
					el = parent.childNodes[index+adjustIndex[level]];
					const {props, children} = patches;
					__internal.patchProps({
						parent:el, 
						patches:props
					});

					if(__internal.isNullOrUndefined(adjustIndex[level+1])){
						adjustIndex[level+1] = 0;
					}

					for (let i=0;i<children.length;i++) {

						if(__internal.isNullOrUndefined(children[i]) === false){

							if(children[i].isFragment === true){

								let tempAdjustIndex = 0;

								children[i].children.forEach((childPatch,j)=>{

									if(childPatch === null){
										tempAdjustIndex--;
									}

									__internal.patch({
										parent:el, 
										patches:childPatch,
										index:(i+j+tempAdjustIndex),
										level: level+1,
										adjustIndex, 
										isPrevFragment:true
									});

								});

							}	else {

								__internal.patch({
									parent: el, 
									patches:children[i],
									index:i,
									level: level+1,
									adjustIndex,
									isPrevFragment:false
								});

							}

						} else {

							__internal.patch({
								parent:el, 
								patches:children[i],
								index:i,
								level:level+1,
								adjustIndex,
								isPrevFragment:false
							});

						}

					}
				}
			}
		}




		__internal.patchThePatches = ({parent, patches, index=0, level=0, adjustIndex=[0]}) => {
			__internal.patch({
				parent, 
				patches, 
				index, 
				level, 
				adjustIndex,
				isPrevFragment:false
			});
		}


		__internal.assignState = (state,arg) => {
			if(__internal.isNullOrUndefined(state)){
				return {};
			}
			if(typeof state !== "function"){
				throw "State must be function";
			}
			let _state = state(arg);
			if(typeof _state !== "object"){
				throw "State should return object";
			} else if(Array.isArray(_state)){
				throw "State should not return array";
			} else {
				return _state;
			}
		}

		__internal.assignAction = (action,arg) =>{
			if(__internal.isNullOrUndefined(action)){
				return {};
			}
			if(typeof action !== "function"){
				throw "Action must be function";
			}
			let _action = action(arg);
			if(typeof _action !== "object"){
				throw "Action should return object";
			} else if(Array.isArray(_action)){
				throw "Action should not return array";
			} else {
				return _action;
			}
		}

		__internal.assignLifecycle = (lifecycle,arg) =>{
			if(__internal.isNullOrUndefined(lifecycle)){
				return {};
			}
			if(typeof lifecycle !== "function"){
				throw "Lifecycle must be function";
			}
			let _lifecycle = lifecycle(arg);
			if(typeof _lifecycle !== "object"){
				throw "Action should return object";
			} else if(Array.isArray(_lifecycle)){
				throw "Action should not return array";
			} else {
				return _lifecycle;
			}
		}

		__internal.assignData = (data,arg) => {
			if(__internal.isNullOrUndefined(data)){
				return {};
			}
			if(typeof data !== "function"){
				throw "Lifecycle must be function";
			}
			let _data = data(arg);
			if(typeof _data !== "object"){
				throw "Action should return object";
			} else if(Array.isArray(_data)){
				throw "Action should not return array";
			} else {
				return _data;
			}	
		}

		__internal.runLifecycle = ({_lifecycle,name}) => {
			if(typeof _lifecycle[name] === "function"){
				_lifecycle[name]();
			}
		}

		D.component = ({state,data,action,render,lifecycle, props}) => {
			if(typeof render !== "function"){
				throw "Render should be function";
			}
			return function(){
				let _lifecycle = null;
				let _state = null;
				let _action = null;
				let _props = null;
				let _container = null;
				let _vdom = null;	
				let _proxy = null;
				let _data = null;

				let _rerender_timeout = null;

				const _state_handler = {
					set: function (target, prop, receiver) {
						Reflect.set(...arguments);
						rerender();
						return true;
					}
				};

				function rerender(){
					if(_rerender_timeout !== null){
						clearTimeout(_rerender_timeout);
					}
					_rerender_timeout = setTimeout(()=>{					
						__internal.runLifecycle({_lifecycle, name:"beforeUpdate"});

						let _nvdom = render({
							state:_proxy,
							action:_action,
							props:_props,
							data:_data
						});
						let patches = __internal.diff({
							newNode:_nvdom, 
							oldNode:_vdom
						});

						let parent = _container.parentNode;

						let index = [..._container.parentElement.childNodes].indexOf(_container);
						__internal.patchThePatches({
							parent, 
							patches, 
							index
						});
						if(typeof _lifecycle.afterUpdate === "function"){
							_lifecycle.afterUpdate(_proxy);
						}
						_vdom = _nvdom;

						__internal.runLifecycle({_lifecycle, name:"afterUpdate"});

						_rerender_timeout = null;

					},0);
				}

				function mount(container){
					let element = __internal.createElement({
						node:_vdom,
						parent:_container
					});
					_container = element;
					__internal.runLifecycle({_lifecycle, name:"mount"});
					return element;
				}

				function getContainer(){
					return _container;
				}

				function unmount(){
					__internal.runLifecycle({_lifecycle, name:"unmount"});


					_lifecycle = null;
					_state = null;
					_action = null;
					_props = null;
					_container = null;
					_vdom = null;	
					_proxy = null;
					_data = null;

				}

				function setProps(props){
					_props = props;
					rerender();
				}

				return function(props){
					_props = props || {};

					_state = __internal.assignState(state,{
						props:_props
					});

					_proxy = new Proxy(_state,_state_handler);

					_action = __internal.assignAction(action,{
						props:_props,
						state:_proxy
					});

					_data = __internal.assignData(data, {
						state:_proxy,
						props:_props,
					});

					_lifecycle = __internal.assignLifecycle(lifecycle,{
						state:_proxy,
						data:_data,
						action:_action,
						props:_props
					});

					_vdom = render({
						state:_proxy,
						action:_action,
						props:_props,
						data:_data
					});


					return {
						render:mount,
						unmount:unmount,
						setProps:setProps,
						getContainer:getContainer
					}
				}
			};
		}

		D.createApp = ({state,data,action,render,lifecycle}) => {
			return (function(){
				let _lifecycle = null;
				let _state = null;
				let _container = null;
				let _vdom = null;
				let _proxy = null;
				let _action = null;
				let props = null;
				let _data = null;

				let _rerender_timeout = null;

				const _state_handler = {
					set: function (target, prop, receiver) {
						Reflect.set(...arguments);
						rerender();
						return true;
					}
				};

				function rerender(){
					if(_rerender_timeout !== null){
						clearTimeout(_rerender_timeout);
					}
					_rerender_timeout = setTimeout(()=>{
						__internal.runLifecycle({_lifecycle, name:"beforeUpdate"});

						let _nvdom = render({
							state:_proxy,
							action:_action
						});
						let patches = __internal.diff({
							newNode:_nvdom, 
							oldNode:_vdom
						});
						patchThePatches({
							parent:_container, 
							patches
						});
						_vdom = _nvdom;

						__internal.runLifecycle({_lifecycle, name:"afterUpdate"});
					},0);
				}

				function mount(container){
					_container = document.querySelector(container);
					let element = __internal.createElement({
						node:_vdom,
						parent:_container
					});

					__internal.runLifecycle({_lifecycle, name:"mount"});

					_container.appendChild(element);
				}

				function setProps(props){
					_props = props;
					rerender();
				}

				_props = Object.create(null);

				_state = __internal.assignState(state,{
					props:_props
				});

				_proxy = new Proxy(_state,_state_handler);

				_action = __internal.assignAction(action,{
					props:props, 
					state:_proxy
				});

				_data = __internal.assignData(data, {
					state:_proxy,
					props:_props,
				});

				_lifecycle = __internal.assignLifecycle(lifecycle,{
					state:_proxy,
					data:_data,
					action:_action,
					props:_props
				});

				_vdom = render({
					props:_props,
					state:_proxy,
					action:_action,
					data:_data
				});

				return {
					mount:mount,
					setProps:setProps
				}		
			})();
		};

		__internal.loopUntilFragmentEnds = (node) => {
			if(node.type === FRAGMENT){
				let nodes = node.children.map((n)=>{
					return __internal.loopUntilFragmentEnds(n);
				});
				return nodes.flat();
			} else {
				return node;
			}
		}

		D.If = ({props,children})=>{
			let result = props.is;

			if(!!result === true){
				return {
					type:FRAGMENT,
					props:{},
					children:children
				};
			} else {
				return {type:FRAGMENT,props:{},children:[]};
			}
		}

		D.ForEach = ({props,children}) =>{
			const obj = props.on;
			let result = [];
			obj.forEach((value,index)=>{
				let node = children[0](value,index);
				if(node.type === FRAGMENT){
					let nodes = __internal.loopUntilFragmentEnds(node);
					result = [...result, ...nodes];
				} else {
					result.push(node);
				}
			});
			return {
				type:FRAGMENT,
				props:{},
				children:result
			};
		}

		D.Switch = ({props,children}) => {
			const value = props.value;
			const strict = props.strict;
			let result = [];

			for(let i=0;i<children.length;i++){
				if(children[i].props.match === value){
					result = [...result,...children[i].children];
					if(strict === true){
						break;
					}
				}
			}
			return {
				type:FRAGMENT, 
				props:{}, 
				children:result
			};
		}

		D.Case = ({props,children}) => {
			return {
				type:FRAGMENT, 
				props:{
					...props,
					match:props.match
				}, 
				children:children
			};
		}

		__internal.componentList = [...__internal.componentList, D.If, D.ForEach, D.Switch, D.Case];

	})(__internal);
	
	D.createElement = __internal.h;
	
})();