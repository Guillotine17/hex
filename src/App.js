import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from 'react-three-fiber'
import {HexPillar, getPillars, getPillar, getPosition} from './components/hexPillar';
import { HexMover } from './components/hexMover';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three';
import {HEX_SIZE, HEX_W, HEX_H, colors, addPillarRadius} from './constants';
import './App.css';
import * as Stats from 'stats.js';
// import ReactDOM from 'react-dom'


const moversBZoomin = true;
const debugStats = true;

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

if (debugStats) {
  var myStats = createStats();
  document.body.appendChild( myStats.domElement );
}

function App() {
  const [movers, setMovers] = useState([]);
  const [mode, setMode] = useState('ACTIVE');
  const [pillars, setPillars] = useState(getPillars());
  // let pillars = getPillars(setMovers, movers);
  return (
    <>
      <Canvas camera={{ fov: 45, position: [0, 0, 100] }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <BattleMap {...{pillars, movers, setMovers, setPillars, mode}}/>
        <CameraControls/>
      </Canvas>
      <ModeToggle {...{mode, setMode}}/>
      <HUD {...{movers, setMovers, pillars}}/>
    </>
  );
}

function getAddPoints(pillars) {
  const alreadyChecked = [];
  const initialAddPoints = [];
  pillars.forEach((pillar) => {
    for (let colIndex = pillar.userData.column - addPillarRadius; colIndex <= pillar.userData.column + addPillarRadius; colIndex++) {
      for (let rowIndex = pillar.userData.row - addPillarRadius; rowIndex <= pillar.userData.row + addPillarRadius; rowIndex++) {
        const checkKey = colIndex + '|' + rowIndex;
        if (alreadyChecked.includes(checkKey)) continue;
        alreadyChecked.push(checkKey);
        if (pillars.find((pillar) => {
          return (pillar.userData.column === colIndex && pillar.userData.row === rowIndex);
        })) continue;
        const[x, y, z] = getPosition(rowIndex, colIndex)
        initialAddPoints.push(getAddPoint({rowIndex, colIndex, position: [x,y,z]}));
      }
      
    }
  });
  return initialAddPoints;
}
function getAddPoint({rowIndex, colIndex, position: [x,y,z]}) {
  return {
    row: rowIndex,
    col: colIndex,
    key: 'col' + colIndex + 'row' + rowIndex,
    position: [x + .5 * HEX_W - 1 , y + .5 * HEX_H - 1, z],
  }
}
function BattleMap(props) {
  const {pillars, movers, setMovers, setPillars, mode} = props;
  const [addPoints, setAddPoints] = useState(getAddPoints(pillars)); 
  useFrame(() => {
    // console.log(movers);
    if (moversBZoomin && movers.length && Math.random() < .01 * movers.length ) {
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
      {addPoints.map(addPoint => 
      <AddPoint
          {...addPoint}
          userData={{ key: addPoint.key,
                      movers,
                      setMovers,
                      addPoints,
                      setAddPoints,
                      getPillar,
                      setPillars,
                      pillars,
                      mode
                    }}
      />)}
      { pillars.map(pillar => 
        <HexPillar
            {...pillar} 
            userData={{
              ...pillar.userData,
              key: pillar.key,
            setMovers,
            movers,
            pillars,
            setPillars,
            addPoints,
            setAddPoints,
            getAddPoint,
            mode}}
            key={pillar.key}  /> )}
      { movers.map(mover => <HexMover key={mover.key} {...mover} /> )}
    </>
  )
}
function ModeToggle(props) {
  const { mode, setMode } = props;
  return (
    <button style={{position: "absolute", bottom: '0px', left: '0px'}} onClick={e => setMode(mode === 'ACTIVE' ? 'EDIT' : 'ACTIVE')}>CURRENT: {props.mode}</button>
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

function AddPoint(props) {
  const [hovered, setHover] = useState(false)
  const [clicked, setClicked] = useState(false)
  const {row, col, userData: {key, movers, setMovers, addPoints, setAddPoints, getPillar, setPillars, pillars, mode}} = props;
  const mesh = useRef();

  const handlePointerOver = (e) => setHover(true);
  const handlePointerOut = (e) => {if (!clicked) setHover(false);}
  function convertToHexPillar(e) {
    setClicked(true);
    console.log(e.eventObject)
    setPillars([...pillars, getPillar({row, col, movers, setMovers})]);
    // addPoints
    
    setAddPoints(addPoints.filter((addPoint) => {
      return addPoint.key !== key;
    }));
  }
  return (
    <mesh
      visible={mode !== 'ACTIVE'}
      ref={mesh}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      {...props}
      onClick={e => convertToHexPillar(e)}
      scale={hovered ? [1.2, 1.2, 1.2]: [1,1,1]}
    >
      <meshStandardMaterial attach="material" color={hovered ? 'hotpink' : 'green'} />
      <boxBufferGeometry attach="geometry" args={[2,2,2]}></boxBufferGeometry>
    </mesh>
  )
}

extend({ OrbitControls });
function CameraControls() {
  const { gl: { domElement }, camera } = useThree();
  useFrame(({ gl, scene, camera }) => {
    if (debugStats) myStats.update();
    gl.render(scene, camera)
  }, 1);
  return <orbitControls args={[camera, domElement]} />
}


export default App;
