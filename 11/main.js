
var container;
var camera;
var cameraTarget;
var light;
var scene;
var renderer;
var group;
var mousex =0, mousey=0;

var world, bp;
var balls = [];

var SHADOW_MAP_WIDTH = 2048;
var SHADOW_MAP_HEIGHT = 2048;


function init(){

	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
	
	//container
	container = document.createElement('div');
	document.body.appendChild(container);

	var width = window.innerWidth;
	var height = window.innerHeight;

	//scene
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0xeeeeee, 1, 1000);

	//group
	group = new THREE.Object3D();
	scene.add( group );

	//camera
	camera = new THREE.PerspectiveCamera( 40, width/height, 1, 1000 );
	camera.position.x = 0;
	camera.position.y = 400;
	camera.position.z = -400;
	scene.add(camera);

	cameraTarget = new THREE.Object3D();
	cameraTarget.position.y = 30;
	//camera.target = cameraTarget;


	//renderer
	renderer = new THREE.WebGLRenderer();
	renderer.autoClear = false;
	renderer.setSize( width, height );
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
	renderer.shadowMapDarkness = 0.10;
	renderer.shadowMapWidth = SHADOW_MAP_WIDTH;
	renderer.shadowMapHeight = SHADOW_MAP_HEIGHT;
	renderer.setClearColorHex(0xeeeeee, 1.0);
	document.body.appendChild ( renderer.domElement );

	
	//event
	document.addEventListener('mousemove', mouseMove);
	window.addEventListener('resize', resize, false);
	document.addEventListener('click', createHeavyObj)

	createScene();
	animate();

}

function mouseMove(ev){
	mousex = ev.clientX - window.innerWidth/2;
	mousey = ev.clientY - window.innerHeight/2;
}

function resize(){
	var stageWidth = window.innerWidth;
	var stageHeight = window.innerHeight;
	camera.aspect =  stageWidth/stageHeight;
	renderer.setSize(stageWidth, stageHeight)
	camera.updateProjectionMatrix();
}

function createScene(){

	world = new CANNON.World();
	world.gravity.set(0,-250,0);
	world.broadphase = new CANNON.NaiveBroadphase();;
	world.iterations = 2;

	//light
    var ambient = new THREE.AmbientLight( 0x333333);
    scene.add( ambient );

	var light = new THREE.SpotLight( 0xffffff, 0.9);
	light.castShadow = true;
	light.position.set (0,600,0);
	scene.add(light);

	
	//ground
	var geometry = new THREE.PlaneGeometry(10000,10000);
	var planeMaterial = new THREE.MeshBasicMaterial( {color:0xbbbbbb });
	var ground = new THREE.Mesh( geometry, planeMaterial );
	ground.castShadow = true;
	ground.receiveShadow = true;
	ground.rotation.x = -Math.PI/2;
	group.add( ground );

	var groundShape = new CANNON.Plane( new CANNON.Vec3(0,1,0));
	var groundBody = new CANNON.RigidBody( 0, groundShape );
	world.add(groundBody);

	// plane -x
    var planeShapeXmin = new CANNON.Plane(new CANNON.Vec3(0,0,1));
    var planeXmin = new CANNON.RigidBody(0, planeShapeXmin);
    planeXmin.position.set(0,0,-50);
    world.add(planeXmin);

    // Plane +x
    var planeShapeXmax = new CANNON.Plane(new CANNON.Vec3(0,0,-1));
    var planeXmax = new CANNON.RigidBody(0, planeShapeXmax);
    planeXmax.position.set(0,0,50);
    world.add(planeXmax);

    // Plane -z
    var planeShapeYmin = new CANNON.Plane(new CANNON.Vec3(1,0,0));
    var planeYmin = new CANNON.RigidBody(0, planeShapeYmin);
    planeYmin.position.set(-50,0,0);
    world.add(planeYmin);

    // Plane +z
    var planeShapeYmax = new CANNON.Plane(new CANNON.Vec3(-1,0,0));
    var planeYmax = new CANNON.RigidBody(0, planeShapeYmax);
    planeYmax.position.set(50,0,0);
    world.add(planeYmax);


	//sphere
	var sphereMaterial = new THREE.MeshPhongMaterial( { color: 0xdddddd, specular: 0xdddddd, ambient: 0xdddddd, shininess: 0, perPixel: true } );
	for (var i = 0; i < 80; i++) {

		var sphereR = Math.random()*6+3;
		var sphereGeometry = new THREE.SphereGeometry(sphereR,16,16);
		var sphereShape = new CANNON.Sphere(sphereR);

		var sphereMesh = new THREE.Mesh( sphereGeometry, sphereMaterial);
		sphereMesh.castShadow = true;
		sphereMesh.receiveShadow = true;
		group.add( sphereMesh );
		sphereMesh.useQuaternion = true;

		//Physics
		var randX = (Math.random()*2-1)*10;
		var randZ = (Math.random()*2-1)*10;
		var sphereBody = new CANNON.RigidBody(0.40,sphereShape);

		//start position
		var pos = new CANNON.Vec3( 0, i*4+100, 0);
		sphereBody.position.set(pos.x + randX, pos.y, pos.z+randZ);
		sphereMesh.position = sphereBody.position;
		// sphereMesh.rotation = sphereBody.rotation;

		balls.push({mesh:sphereMesh, body:sphereBody});
		world.add(sphereBody);

	}

	createHeavyObj("A");



}



function removingBall(id){

	var update = function(){
		heavyObjs[id].mesh.scale.x = obj.scale;
		heavyObjs[id].mesh.scale.y = obj.scale;
		heavyObjs[id].mesh.scale.z = obj.scale;
		heavyObjs[id].body.radius = obj.scale;
	}

	var complete = function(){
		group.remove(heavyObjs[id].mesh);
		world.remove(heavyObjs[id].body);
		scene.remove(heavyObjs[id].light);
		heavyObjs.splice(id,1);
	}

	var obj = {scale:1};
	var tObj = {scale:0}
	var tween = new TWEEN.Tween(obj).to(tObj, 200).onUpdate(update).onComplete(complete);
	tween.start();
	
}


var maxHeavyObjNum = 4;
var heavyObjs = [];

function createHeavyObj(chr){

	if(heavyObjs.length>maxHeavyObjNum){
		removingBall(0);
	}

	var r = 10+Math.random()*30;
	var sphereShape = new CANNON.Sphere(r);
	var heavyObjBody = new CANNON.RigidBody(75, sphereShape);
	heavyObjBody.position.set(50*(2*Math.random()-1), r/2+400,50*(2*Math.random()-1))
	world.add(heavyObjBody);

	//visual
	var sphereGeometry = new THREE.SphereGeometry( r, 16, 16);
	var sphereMaterial = new THREE.MeshPhongMaterial( { color: 0xff8d28, specular: 0xffffff, ambient: 0xff5a16, shininess: 250, perPixel: true } );
	var heavyObjMesh = new THREE.Mesh( sphereGeometry, sphereMaterial );
	heavyObjMesh.position = heavyObjBody.position;
	heavyObjMesh.castShadow = true;
	heavyObjMesh.receiveShadow = true;
	heavyObjMesh.useQuaternion = true;
	group.add(heavyObjMesh);

	//light
	var light = new THREE.PointLight( 0xff8d28, 1, r+50 );
	light.position = heavyObjMesh.position;
	scene.add(light);


	heavyObjs.push({mesh:heavyObjMesh, body:heavyObjBody, radius:r, light:light});

}


function animate(){
	requestAnimationFrame(animate);
	TWEEN.update();
	update();
	render();
}

var cr = 0;

function update(){

	//camera
	cr -= mousex*0.000025;
	camera.position.y += ( -mousey/5 + 100 - camera.position.y)*0.02;
	camera.position.x = 200*Math.cos(cr);
	camera.position.z = 200*Math.sin(cr);
	camera.lookAt(cameraTarget.position)

	
	//Physics
	if (!world.paused) {
		world.step(1.0/60.0);
		// var l = balls.length - 1;
		// for (var i = l; i >= 0; i--) {
		// 	if(balls[i].body.position.y<-300) balls[i].body.position.set(0,300,0);
		// 	// balls[i].body.getPosition(balls[i].mesh.position);
		// 	// balls[i].body.getOrientation(balls[i].mesh.quaternion);
		// 	// balls[i].mesh.position = balls[i].body.position;
		// };

		// //heavyObj
		// for (var i = heavyObjs.length - 1; i >= 0; i--) {
		// 	// heavyObjs[i].body.getPosition( heavyObjs[i].mesh.position );
		// 	// heavyObjs[i].body.getOrientation( heavyObjs[i].mesh.quaternion );
		// 	// heavyObjs[i].light.position = heavyObjs[i].mesh.position;
		// };


	};

}

function render(){
	renderer.clear();
	renderer.render( scene, camera );
}




