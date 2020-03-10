import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree, extend } from 'react-three-fiber'
import {HexPillar, getPillars} from './components/hexPillar';
import { HexMover } from './components/hexMover';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three';
import {useSprings, animated} from 'react-spring'
import {HEX_SIZE, HEX_W, HEX_H} from './constants';
import './App.css';
import * as Stats from 'stats.js';
// import ReactDOM from 'react-dom'


extend({ OrbitControls })
const colors = ['red', 'blue', 'green', 'hotpink', 'brown', 'teal', 'grey'];
const moversBZoomin = true;

function moverToPillar(targetMover, pillar, setMovers, movers) {
  console.log(pillar)
  const {position: [x, y, z], userData: {pillarHeight}} = pillar;
  setMovers(movers.map((mover) => ({ ...mover, position: mover.key === targetMover.key? [x + .5 * HEX_W, y + .5 * HEX_H, pillarHeight + 1 + z] : mover.position})));
}

function getRandomEntry(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function createStats() {
  var stats = new Stats();
  stats.setMode(0);
  
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0';
  stats.domElement.style.top = '0';
  
  return stats;
}
var myStats = createStats();
document.body.appendChild( myStats.domElement );


function App() {
  const [movers, setMovers] = useState([]);
  let pillars = getPillars(setMovers, movers);
  return (
    <>
      <Canvas camera={{ fov: 45, position: [0, 0, 100] }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <BattleMap {...{pillars, movers, setMovers}}/>
        <CameraControls/>
      </Canvas>
      <HUD {...{movers, setMovers, pillars}}/>
    </>
  );
}

function BattleMap(props) {
  const {pillars, movers, setMovers} = props;
  useFrame(() => {
    // console.log(movers);
    if (moversBZoomin && movers.length && Math.random() < .02 ) {
      console.log('firing')
      const targetMover = getRandomEntry(movers);
      const targetPillar = getRandomEntry(pillars);
      console.log(targetMover, targetPillar);
      moverToPillar(targetMover, targetPillar, setMovers, movers);
    } else {
      // console.log(frame);
    }
  })
  return (
    <>
      { pillars.map(pillar => <HexPillar key={pillar.key} {...pillar} /> )}
      { movers.map(mover => <HexMover key={mover.key} {...mover} /> )}
    </>
  )
}

function HUD(props) {
  const {movers, setMovers, pillars } = props;
  console.log(props);
  return (
      <div style={{position: 'absolute', top: '0px', right: '0px'}} >
      {props.movers.map(mover =>
        <div key={mover.key}>
          <button key={mover.key}
            onClick={ e=> {
              setMovers(movers.map(tempMover => {
                return {...tempMover, active: mover.key === tempMover.key ? !mover.active : tempMover.active }
              }))
            }}
            >
            { mover.key }
            { mover.active ? ' active':'' }
          </button>
        </div>)}
      <div>
        <button onClick={ e=> spawnMover(movers, setMovers, pillars)}> + </button>
      </div>
    </div>
  )
}
function spawnMover(movers, setMovers, pillars) {
  const targetPillar = getRandomEntry(pillars);
  let tempMovers = movers.map(mover => ({...mover, active: false}));
  const {position: [x, y, z], userData: {pillarHeight}} = targetPillar;

  tempMovers = [...tempMovers, {
    key: movers.length + 1,
    active: true,
    color:  getRandomEntry(colors),
    position: [x + .5 * HEX_W, y + .5 * HEX_H, pillarHeight + 1 + z]
  }];
  setMovers(tempMovers);
}



function CameraControls() {
  const { gl: { domElement }, camera } = useThree();
  useFrame(({ gl, scene, camera }) => {
    myStats.update();
    gl.render(scene, camera)
  }, 1);
  return <orbitControls args={[camera, domElement]} />
}


export default App;
