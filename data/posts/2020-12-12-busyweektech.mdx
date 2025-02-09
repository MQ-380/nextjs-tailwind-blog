---
layout: post
title: 忙碌的一周
date: 2020-12-12 00:30:36 +0800
category: 技术
tags: [前端, React, 工作, 项目]
---


这一周我度过了可能是入职以来最“忙碌”的一周。一周工时长达了63小时。当然大多数的事情是因为自己在之前完成需求的疏漏，从而产生了如此的结果。这一周还是收获到一些内容的，例如做新需求的时候，学到了一些已经不算新但是好像是第一次付诸实践的东西。

总结一下，以备后查。

## React Context 与 Hooks
React在几年前引入了新的Context的使用方法，主要的组成部分为生成Context对象的createContext方法，以及其对应的Provider对象以及Consumer对象。

这些其实都很简单，如果看官方文档的话能够解释的比我更清楚，所以引入一下连接 -> 
[Context – React](https://reactjs.org/docs/context.html)

那么我想要总结的是，如何把这个Context和新的Hooks结合起来的话，会产生什么样的内容呢？

首先这里Hooks，我们就用到了useContext这个。这个的作用其实就是用来替代Consumer这个东西的。我个人浅薄的认识，useContext和Consumer有这样的区别：

useContext可以在“真实消费”的组件中使用，直接把需要的Context的内容引入，即可使用。而Consumer则有一种“高阶组件”的感觉，把原有的消费组件套入Consumer包裹的内容中，把高阶组件中的内容化为props传入原有组件，在原有组件中利用props来获取这个context

因为useContext的内容获取的第一个参数是要用createContext的对象传入，所以需要有一个独自的组件export出这个，这样可以更好的做引用。

落实到实际的项目中，使用一下useContext。

```javascript

let themeContext = createContext({});

//及时export
export {themeContext}

/*
其实可以直接吧".Provider" 放到要用的地方，这样做可以动态变化Context。
但是如果直接导出这个会导致性能问题，产生很多不必要的渲染.所以这里可以把利用props.children插入的方法优化性能，具体的原因前人之述备矣。
*/

function ContextProvier(props) {
	let [ themeContextState,  setThemeContextState ] = useState({});
	let value = {themeContextState, setThemeContextState}
	return (
		<themeContext.Provider
		value={value}>
			{props.children}
		</themeContext.Provider>
	);
}

/*
useContext
*/

function useContextConsumer() {
	let { themeContextState, setThemeContextState } = useContext(themeContext);
   // 只要继续使用即可。

	// 修改context的话？ 这样会重新设置Provider组件中的state，这样就会触发重新渲染。
	setThemeContext({a: '123'})
	
	return ()
}

```

其实用useContext很简单，但是这里想要特别说的其实是useEffect的坑。

useEffect因为渲染机制的关系，那么useEffect这个里面的回调函数（setTimeOut, 事件回调等）所拿到的数据都是那一次渲染的数据，和context结合的话，如果set之后有了新数据，但是在回调中拿到的仍然会是上一次的数据。

解决的方案，其实可能会有更优雅的方案，但是我所利用的或许是最原始的。利用useRef的current属性，这样才会拿到最新的值。

举例： 

```javascript
function withContextAndEffect() {
	let { themeContextState } = useContext(themeConext);
	let [ themeRef ] = useRef(themeContextState);

	useEffect(() => {
		themeRef.current = themeContextState;
	}, [themeContextState])

	useEffect(() => {
		setTimeout(()=> {
			//如果有修改这里拿到的是最新的
			console.log(themeRef.current);
			//这里还是会上次的
			console.log(themeContextState);
		}, 1000)
	}, [])
}
```

这个坑其实很容易被识别，还是在这里记着了。

## Node同构

我们的主项目是通过Node同构直出的，Node同构有很多的优势，例如减少首屏渲染时间，更好的支持SEO， 充分利用了服务器的性能。

当然这里如果要说Node同构的优势就有点老生常谈了，这里讲讲Node同构所带来的一些不方便点。

比如，一些需求中需要在给我们的后台服务拉取数据的时候，需要拿到用户当前的位置，那么由于有Node这一层的存在，我们就需要其他的第三方服务给我们拼接一些数据在链接后面才能给到后台。

又如在编程写React组件的时候，需要注意到的不能够轻易使用window, navigator等只有在浏览器宿主中才能够获取到的对象。否则会导致报错，导致renderToStringError。如果没有很好的兜底的话，可能导致整个服务的崩溃。

在利用Node时候，也要注意对服务器运行的稳定性以及要做好降级预案，否则会导致服务的不稳定。

Node的导入让前端的性能可以进一步优化，首屏的体验会变得更好，但利用Node优势的同时也要主要到一些坑点。仅仅在这里有所记录。

## 项目的全局观

其实整个项目有着很多的功能，有时候不能想当然的把已经上线已久的服务作为稳定的依靠，在新添加功能的时候需要更好的了解老逻辑，老逻辑是否可靠，是否需要和它对齐来让整个功能才能正确使用，这个都是需要考虑到的，不能够只想到自己这部分的内容有着更好的方案，否则就会导致大问题。

两年多来自以为对项目的业务层很了解，这次的问题让我意识到其实自己没有深入自己业务范围之外的内容，还是需要更全局的宏观观点。这样才能够更好的实现任务。

一周的忙碌希望可以有所收获吧~

