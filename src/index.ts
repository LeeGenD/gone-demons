interface Size {
    width: number;
    height: number;
}

class Resource {
	url: string;
	content: any;
	constructor(url: string) {
		this.url = url;
		this.content = new Image();
		this.content.src = url;
	}
}

class BaseObject {
	x: number;
	y: number;
	size: Size;
	color: string;
	res: Resource;
	constructor(x:number, y:number, size?:Size, color?: string) {
		this.x = x;
		this.y = y;
		this.size = size || {width: 50, height: 50};
		this.color = color;
	}

	setPos(x:number, y:number) {
		this.x = x;
		this.y = y;
	}

	setContent(res: Resource) {
		this.res = res;
	}
}

class Scene {
	size: Size;

	constructor(size:Size) {
		this.size = size || {
			width: 1000,
			height: 600
		};
	}
}

class Painting {
	id: string;
	dom: any;
	ctx: any;
	renderList: BaseObject[];
	constructor(id: string) {
		this.id = id;
		this.dom = document.getElementById(id);
		this.ctx = this.dom.getContext('2d');
		this.renderList = [];
		this.startRender();
	}
	render() {
		this.ctx.clearRect(0, 0, 1000, 1000);
		for (let item of this.renderList) {
			this.ctx.fillStyle = item.color;
			item.color && this.ctx.fillRect(item.x,item.y,item.size.width,item.size.height);
			if (item.res) {
				this.ctx.drawImage(item.res.content,item.x,item.y,item.size.width,item.size.height);
			}
		}
	}
	startRender() {
		this.render();
		window.requestAnimationFrame(this.startRender.bind(this));
	}
	setRenderList(renderList: BaseObject[]) {
		this.renderList = renderList;
	}
	addToRenderList(bo: BaseObject) {
		this.renderList.push(bo);
	}
}

class SizeAdapter {
	static parentDom = window;
	whRatio: number;//宽高比
	dom: any;
	parentDom: any;
	constructor(whRatio:number, dom: any, parentDom?: any) {
		this.whRatio = whRatio;
		this.dom = dom;
		this.parentDom = SizeAdapter.parentDom;
		this.listener();
		this.resize();
	}

	listener() {
		this.parentDom.addEventListener('resize', this.resize.bind(this));
	}

	resize() {
		let width = this.parentDom.innerWidth;
		let height = this.parentDom.innerHeight;
		let whRatio = width / height;
		let finalWidth = 0;
		let finalHeight = 0;
		if (whRatio > this.whRatio) {
			finalHeight = height;
			finalWidth = finalHeight * this.whRatio;
		} else {
			finalWidth = width;
			finalHeight = finalWidth / this.whRatio;
		}
		finalWidth -= 20;
		finalHeight -= 20;
		this.dom.style.width = finalWidth + 'px';
		this.dom.style.height = finalHeight + 'px';
	}
}

let painting = new Painting('painting');
let treeResource = new Resource('./img/tree.png');
let manResource = new Resource('./img/man2.png');
let ghostResource = new Resource('./img/ghost.png');
function createTree(x = 0, y = 0) {
	let object = new BaseObject(x, y , {
		width: 40,
		height: 40
	}, '#ddd');
	object.setContent(treeResource);
	return object;
}
function createMan(x = 0, y = 0) {
	let object = new BaseObject(x, y , {
		width: 40,
		height: 40
	});
	object.setContent(manResource);
	return object;
}
function createGhost(x = 0, y = 0) {
	let object = new BaseObject(x, y , {
		width: 40,
		height: 40
	});
	object.setContent(ghostResource);
	return object;
}
painting.setRenderList([
	// 树林方块
	createTree(40, 40), createTree(80, 40), createTree(120, 40),
	createTree(40, 80), createTree(80, 80), createTree(120, 80),
	createTree(40, 120), createTree(80, 120), createTree(120, 120),
	// 树林
	createTree(200, 40), createTree(240, 40), createTree(280, 40),
	createTree(280, 80),
	createTree(200, 120), createTree(240, 120), createTree(280, 120),
	// 树林
	createTree(0, 200), createTree(40, 200), createTree(120, 200),
	createTree(160, 200), createTree(200, 200), createTree(240, 200), createTree(280, 200),
	createTree(320, 200), createTree(360, 160), createTree(360, 120), createTree(360, 80), createTree(360, 0),
	// 树林
	createTree(40, 280), createTree(80, 280), createTree(120, 280),
	createMan(960, 0),
	createGhost(400, 0)
]);
new SizeAdapter(1000/600, document.getElementById('painting'));