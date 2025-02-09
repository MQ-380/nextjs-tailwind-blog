---
layout: post
title: JavaScript红宝书再阅读（1）
date: 2021-3-3 19:00:00 +0800
category: 技术
tags: [JavaScript, 前端, 读书笔记, 再学习]
---

# 第9章 代理与反射

**注意：本章的内容是ES6之后的专属，注意兼容性。**

## 1. **代理的定义与创建**

代理是目标对象的抽象，类似于C++的指针。可以用作目标对象的替身，但又完全独立于目标对象。

Ex:

```jsx
const target = {
	id: 'target',
};

const handler = {};

//需要两个参数，一个是目标对象，一个是处理程序对象，生成一个新的代理对象
const proxy = new Proxy(target, handler);

console.log(target.id); // target 
console.log(proxy.id);  // target

target.id = 'foo';
console.log(target.id, proxy.id); //foo foo

proxy.id = 'bar';
console.log(target.id, proxy.id); //bar bar

console.log(target.hasOwnProperty('id')); //true
console.log(proxy.hasOwnProperty('id'));  //true

//Attention: Proxy没有prototype，所以无法使用instanceOf
console.log(target instanceof Proxy) //TypeError
console.log(proxy instanceof Proxy) //TypeError
console.log(proxy instanceof Object) // true
console.log(typeof proxy ) // "object"

//相等可以区分两者
console.log(target === proxy); // false
console.log(target == proxy); // false 

```

## 2.代理的作用

主要目的是可以定义捕获器（trap）（基本操作拦截器）

每次在代理对象上调用这些方法的时候，代理可以在这些操作传播到目标对象前先调用捕获器函数，从而拦截相关行为。

Ex.:

```jsx
const target = {foo: 'bar'};
const handler = {
	// 捕获器在处理程序中以方法名为键。
// 任何捕获器都有三个参数：目标对象，要查询的属性，代理对象
	get(trapTarget, property, receiver) {
		console.log(trapTarget === target);
		console.log(property);
		console.log(receiver === proxy);
		//重新创建get的原始行为
		// return trapTarget[property];
		return 'handler override';	
	}
}

const proxy = new Proxy(target, handler);

//可以触发get的方式：
proxy[property] // 直接获取属性, 只会获取到get中返回的内容
proxy.foo
// true
// foo
// ture
// handler override 

proxy.property  // 直接获取属性
Object.create(proxy)[property] 

```

想要触发get就一定要在proxy对象上进行操作，否则不会触发捕获器。在原target上就不会

## 3.Reflect对象

所有捕获器都能够基于参数创建原始操作，但是有些操作会比较复杂。所以可以调用全局Reflect对象的同名方法来创建（Reflect对象封装了原始行为）

```jsx
const target = {foo: 'bar'};
const handler = {
	get() {
		return Reflect.get(...arguments);
	}
}

/*
更简洁：
const handler = {
	get: Reflect.get
}
*/

const proxy = new Proxy(target, handler);

// 创建一个捕获所有方法，然后将方法转发给反射API的空代理，可以使用
const proxyReflect = new Proxy(target, Reflect);
```

## 4.捕获器不变式

捕获器设置限制：

捕获器不变式（trap invariant)：因方法不同而异，但通常会防止捕获器定义出现过于反常的行为。

Ex. 目标对象有一个不可配置且不可写的数据属性，那么在捕获器返回一个与该属性不同的值时，会抛出TypeError

```jsx
const target = {};
Object.defineProperty(target, 'foo', {
	configurable: false,
	writable: false,
	value: 'bar',
});

const handler = {get: ()=>'qux'}

const proxy = new Proxy(target, handler);
console.log(proxy.foo)
// TypeError
```

## 5.撤销代理

new Proxy创建的代理在生命周期中会一直存在，如果要撤销可以使用revocable()方法来创建代理，并且创建出来的revoke方法是幂等的，调用多少次结果都一样。

revoke之后再调用这个代理对象会得到TypeError

Ex:

```jsx
const target = {
	foo: 'bar',
};

const handler = {get: ()=>'intercepted'}

const { proxy, revoke } = Proxy.revocable(target, handler);
console.log(proxy.foo) // 'intercepted'
console.log(target.foo) // 'bar'

revoke();

console.log(proxy.foo) // TypeError

```

## 6.反射API

反射API并不限于捕获处理程序，大多数反射API方法在Object类型上有对应的方法。

通常Object上的方法适用于通用程序，而反射方法适用于细粒度的对象控制与操作。

：

一些反射方法返回的是状态标记的布尔值，表示操作是否成功。

Ex:

```jsx
const o = {};
try {
	Object.defineProperty(o, 'foo', 'bar');
	console.log('success');
}catch(e) {
	console.log('fail');
}

//利用Reflect的状态标记重构：
const o = {};
if(Reflect.defineProperty(o, 'foo', 'bar')) {
	console.log('success');
} else {
	console.log('fail');
}

//返回状态标记的Reflect方法；
Reflect.defineProperty();
Reflect.perventExtensions();
Reflect.setProtoTypeOf();
Reflect.set();
Reflect.deleteProperty();

//用函数来替代操作符
Reflect.get(); // 替代对象访问操作符
Reflect.set(); // 替代=操作符
Reflect.has(); // 替代in/with()
Reflect.deleteProperty(); // 替代delete
Reflect.construct(); // 替代new

//安全调用可能已经被重载的方法
Reflect.apply(myFunc, thisVal, argu);

```

## 7.多层次代理

```jsx
//代理另一个代理
const target = {
	foo: 'bar'	
};

const firstProxy = new Proxy(target, {
	get() {
		console.log('first proxy');
		return Reflect.get(...arguments);	
	}
});

const secondProxy = new Proxy(firstProxy, {
	get() {
			console.log('second proxy');
			return Reflect.get(...arguments);	
	}
});

console.log(secondProxy.foo);
// second proxy
// first proxy
// 'bar'
```

## 8.代理的问题

1. 代理中的this

    ```jsx
    const target = {
    	thisValEqualProxy() {
    		return this === proxy
    	}
    }
    const proxy = new Proxy(target, {});

    console.log(target.thisValEqualProxy()); // false
    console.log(proxy.thisValEqualProxy()); // true
    ```

2. 无法与Date等存在Proxy没有的内部槽位方法的对象共存使用

```jsx
const target = new Date();
const proxy = new Proxy(target, {});

console.log(proxy instanceof Date); // true
proxy.getDate(); 
// TypeError: 因为这个方法依赖于this中的[[NumberDate]]，
// 代理对象上不存在，所以抛出TypeError
```

## 9.代理捕获器与反射方法

get
set
has 
defineProperty
getOwnPorpertyDescriptor
deletePorperty
ownKeys
getPropertyOf
setPropertyOf
isExtensible
preventExtensions
apply
construct

具体参考中文版红宝书P275 - P283

## 10.代理模式

### **跟踪属性访问**

通过捕获get set has等操作，可以知道对象属性什么时候被访问过，被查询过。

### 隐藏属性

### 属性验证

验证所给的值是允许还是拒绝赋值

### 函数与构造函数参数验证

只让函数接受某种类型的值

### 数据绑定与可观察对象

```jsx
// 跟踪属性访问
const user = {name: 'Jack'};
const proxy = new Proxy(user, {
	get(target, property, receiver){
		console.log(`getting ${property}`);
		return Reflect.get(...arguments);
	},

	set(target, property, value, receiver){
		console.log(`setting ${property}=${value}`);
		return Reflect.set(...arguments);
	}
});

// 隐藏属性
const hidden = ['foo', 'bar'];
const targetObject = {
	foo: '1',
	bar: '2',
	baz: '3',
};

const proxy = new Proxy(target, {
	get(target, property){
		if(hidden.includes(property)) {
			return undefined;	
		}	else {
			return Reflect.get(...arguments);
		}
	},

	has(target, property) {
		if(hidden.includes(property)) {
			return false;	
		}	else {
			return Reflect.has(...arguments);
		}
	}
});

//属性验证
const proxy = new Proxy(target, {
	set(target, property, value, receiver) {
		if(typeof value !== 'number') {
			return false;	
		} else {
			Reflect.set(...arguments);
		}
	}
});

//函数与构造函数参数验证 
const proxy = new Proxy(target, {
	apply(target, thisArg, argList) {
		for(const arg of argList) {
			if(typeof arg !== 'number') throw 'Non-number argument provided';
		}
		return Reflect.apply(...arguments);
});

//数据绑定与可观察对象
/*
	1. 将被代理的对类绑定到一个全局实例集合，让所有创建的实例都可以放入到这个集合中
	2. 把集合绑定到一个事件分派程序，每次插入新实例都会发送消息
	代码见书P285-286
*/
```

