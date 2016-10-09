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

class MoveObject extends BaseObject {
	static MOVE_STATUS = {
		STOP: 0,
		UP: 1,
		DOWN: 2,
		LEFT: 3,
		RIGHT: 4,
		GO_TO: 5
	};
	static speed = 100;
	status: number;
	preTime: number;
	des: Object;
	rafId: number;
	goToData: any;
	constructor(x:number, y:number, size?:Size, color?: string) {
		super(x, y, size, color);
		this.status = MoveObject.MOVE_STATUS.STOP;
	}

	runMove() {
		this.rafId = window.requestAnimationFrame(this.move.bind(this));
	}

	startMove() {
		if (this.status === MoveObject.MOVE_STATUS.STOP) {
			this.runMove();
		}
	}

	stopMove() {
		this.rafId && window.cancelAnimationFrame(this.rafId);
	}

	move() {
		let now = new Date().getTime();
		if (this.status !== MoveObject.MOVE_STATUS.STOP) {
			this.preTime = this.preTime || now;
			let p = (now - this.preTime) / 1000;
			console.log(this.status);
			switch(this.status) {
				case MoveObject.MOVE_STATUS.DOWN:
					this.y += p * MoveObject.speed;
					break;
				case MoveObject.MOVE_STATUS.UP:
					this.y -= p * MoveObject.speed;
					break;
				case MoveObject.MOVE_STATUS.LEFT:
					this.x -= p * MoveObject.speed;
					break;
				case MoveObject.MOVE_STATUS.RIGHT:
					this.x += p * MoveObject.speed;
					break;
				case MoveObject.MOVE_STATUS.GO_TO:
					if (this.reachDes()) {
						this.x = this.goToData.desX;
						this.y = this.goToData.desY;
						this.stop();
						return;
					} else {
						this.x += p * this.goToData.speedX;
						this.y += p * this.goToData.speedY;
					}
					break;
				default:
					break;
			}
			this.runMove();
		}
		this.preTime = now;
	}

	down() {
		this.startMove();
		this.status = MoveObject.MOVE_STATUS.DOWN;
	}

	up() {
		this.startMove();
		this.status = MoveObject.MOVE_STATUS.UP;
	}

	left() {
		this.startMove();
		this.status = MoveObject.MOVE_STATUS.LEFT;
	}

	right() {
		this.startMove();
		this.status = MoveObject.MOVE_STATUS.RIGHT;
	}

	reachDes() {
		let reachX = (this.goToData.speedX > 0 && this.x > this.goToData.desX) ||
			(this.goToData.speedX < 0 && this.x < this.goToData.desX);
		let reachY = (this.goToData.speedY > 0 && this.y > this.goToData.desY) ||
			(this.goToData.speedY < 0 && this.y < this.goToData.desY);
		return reachX && reachY;
	}

	goTo(x: number,y: number) {
		x -= this.size.width / 2;
		y -= this.size.height / 2;
		let width = x - this.x;
		let height = y - this.y;
		let hypotenuse = Math.sqrt(width*width + height*height);
		let speedX = MoveObject.speed * width / hypotenuse;
		let speedY = MoveObject.speed * height / hypotenuse;
		//console.log(speedX, speedY);
		this.goToData = {
			desX: x,
			desY: y,
			speedX: speedX || 1,
			speedY: speedY || 1
		}
		console.log(this.goToData);
		this.startMove();
		this.status = MoveObject.MOVE_STATUS.GO_TO;
	}

	stop() {
		this.status = MoveObject.MOVE_STATUS.STOP;
		this.stopMove();
		this.preTime = null;
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

class EventController {
	static CODE = {
		UP: 38,
		DOWN: 40,
		LEFT: 37,
		RIGHT: 39
	};
	static CMD = {
		KEY_DOWN: 'keydown',
		KEY_UP: 'keyup',
		KEY_LEFT: 'keyleft',
		KEY_RIGHT: 'keyright',
		KEY_STOP: 'keystop',

		CLICK: 'click'
	}
	listenerMap: Object;
	dom: any;
	constructor(id: string) {
		this.listenerMap = {};
		this.dom = document.getElementById(id);
		this.bindEvent();
	}
	addListener(cmd: string, listener: Function) {
		if (this.listenerMap[cmd]) {
			this.listenerMap[cmd].push(listener);
		} else {
			this.listenerMap[cmd] = [listener];
		}
	}
	runCmd(cmd: string, ...arg: any[]) {
		if (this.listenerMap[cmd]) {
			for (let f of this.listenerMap[cmd]) {
				f.apply(window, arg);
			}
		}
	}
	bindEvent() {
		let _this = this;
		window.addEventListener('keydown', function(e) {
			var keyCode = e.keyCode;
			switch(keyCode) {
				case EventController.CODE.UP:
					_this.runCmd(EventController.CMD.KEY_UP);
					break;
				case EventController.CODE.DOWN:
					_this.runCmd(EventController.CMD.KEY_DOWN);
					break;
				case EventController.CODE.LEFT:
					_this.runCmd(EventController.CMD.KEY_LEFT);
					break;
				case EventController.CODE.RIGHT:
					_this.runCmd(EventController.CMD.KEY_RIGHT);
					break;
				default:
					break;
			}
		});
		window.addEventListener('keyup', function(e) {
			_this.runCmd(EventController.CMD.KEY_STOP);
		});
		if (this.dom) {
			this.dom.addEventListener('click', function(e) {
				let pageX = e.pageX;
				let pageY = e.pageY;
				let dom = _this.dom;
				let domX = dom.offsetLeft;
				let domY = dom.offsetTop;
				let domWidth = dom.offsetWidth;
				let domHeight = dom.offsetHeight;
				let xPer = (pageX - domX) / domWidth;
				let yPer = (pageY - domY) / domHeight;
				_this.runCmd(EventController.CMD.CLICK, xPer, yPer);
			});
		}
	}
}

let painting = new Painting('painting');
let treeResource = new Resource('./img/tree.png');
let waterResource = new Resource('./img/water.png');
let manResource = new Resource('./img/man2.png');
let demonResource = new Resource('./img/ghost.png');
let baseSize = 40;
// 树
function createTree(x = 0, y = 0) {
	let object = new BaseObject(x * baseSize, y * baseSize, {
		width: baseSize,
		height: baseSize
	}, '#ddd');
	object.setContent(treeResource);
	return object;
}
// 水
function createWater(x = 0, y = 0) {
	let object = new BaseObject(x * baseSize, y * baseSize, {
		width: baseSize,
		height: baseSize
	}, '#77B3D4');
	object.setContent(waterResource);
	return object;
}
// 人
function createMan(x = 0, y = 0) {
	let object = new MoveObject(x * baseSize, y * baseSize, {
		width: baseSize,
		height: baseSize
	});
	object.setContent(manResource);
	return object;
}
// 恶魔
function createDemon(x = 0, y = 0) {
	let object = new BaseObject(x * baseSize, y * baseSize, {
		width: baseSize,
		height: baseSize
	});
	object.setContent(demonResource);
	return object;
}
let manCharacter = createMan(24, 0);
painting.setRenderList([
	// 树林方块
	createTree(1, 1), createTree(2, 1), createTree(3, 1),
	createTree(1, 2), createTree(2, 2), createTree(3, 2),
	createTree(1, 3), createTree(2, 3), createTree(3, 3),
	// 树林
	createTree(5, 1), createTree(6, 1), createTree(7, 1),
	createTree(7, 2),
	createTree(5, 3), createTree(6, 3), createTree(7, 3),
	// 树林
	createTree(0, 5), createTree(1, 5), createTree(3, 5),
	createTree(4, 5), createTree(5, 5), createTree(6, 5), createTree(7, 5),
	createTree(8, 5), createTree(9, 4), createTree(9, 3), createTree(9, 2), createTree(9, 0),
	// 树林
	createTree(1, 7), createTree(2, 7), createTree(3, 7),
	createDemon(10, 0),
	// 湖
	createWater(24, 14), createWater(23, 14), createWater(22, 14), createWater(21, 14), createWater(20, 14),
	createWater(19, 14), createWater(18, 14), createWater(17, 14), createWater(16, 14), createWater(15, 14),
	createWater(14, 14), createWater(13, 14), createWater(12, 14),

	createWater(24, 13), createWater(23, 13), createWater(22, 13), createWater(21, 13), createWater(20, 13),
	createWater(19, 13), createWater(18, 13), createWater(17, 13), createWater(16, 13), createWater(15, 13),
	createWater(14, 13), createWater(13, 13), createWater(12, 13), createWater(11, 13),	

	createWater(24, 12), createWater(23, 12), createWater(22, 12), createWater(21, 12), createWater(20, 12),
	createWater(19, 12), createWater(18, 12), createWater(17, 12), createWater(16, 12), createWater(15, 12),
	createWater(14, 12), createWater(13, 12), createWater(12, 12),

	createWater(24, 11), createWater(23, 11), createWater(22, 11), createWater(21, 11), createWater(20, 11),
	createWater(19, 11), createWater(18, 11), createWater(17, 11), createWater(16, 11), createWater(15, 11),
	createWater(14, 11), createWater(13, 11),

	createWater(24, 10), createWater(23, 10), createWater(22, 10), createWater(21, 10), createWater(20, 10),
	createWater(19, 10), createWater(18, 10), createWater(17, 10), createWater(16, 10), createWater(15, 10),
	createWater(14, 10),

	createWater(24, 9), createWater(23, 9), createWater(22, 9), createWater(21, 9), createWater(20, 9),
	createWater(19, 9), createWater(18, 9), createWater(17, 9), createWater(16, 9),

	manCharacter
]);
new SizeAdapter(1000/600, document.getElementById('painting'));
var ec = new EventController('painting');
ec.addListener(EventController.CMD.KEY_DOWN, function() {
	manCharacter.down();
});
ec.addListener(EventController.CMD.KEY_UP, function() {
	manCharacter.up();
});
ec.addListener(EventController.CMD.KEY_LEFT, function() {
	manCharacter.left();
});
ec.addListener(EventController.CMD.KEY_RIGHT, function() {
	manCharacter.right();
});
ec.addListener(EventController.CMD.KEY_STOP, function() {
	manCharacter.stop();
});
ec.addListener(EventController.CMD.CLICK, function(x, y) {
	manCharacter.goTo(x * 1000, y * 600);
});