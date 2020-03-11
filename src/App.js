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


const moversBZoomin = false;
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
  const [pillars, setPillars] = useState(getPillars());
  // let pillars = getPillars(setMovers, movers);
  return (
    <>
      <Canvas camera={{ fov: 45, position: [0, 0, 100] }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <BattleMap {...{pillars, movers, setMovers, setPillars}}/>
        <CameraControls/>
      </Canvas>
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
        initialAddPoints.push({
          row: rowIndex,
          col: colIndex,
          key: 'col' + colIndex + 'row' + rowIndex,
          position: [x + .5*HEX_W - 1 , y + .5*HEX_H - 1, z],
        })
      }
      
    }
  });
  return initialAddPoints;
}

function BattleMap(props) {
  const {pillars, movers, setMovers, setPillars} = props;
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
          userData={{key: addPoint.key,
                     movers,
                     setMovers,
                     addPoints,
                     setAddPoints,
                     getPillar,
                     setPillars,
                     pillars}}
      />)}
      { pillars.map(pillar => <HexPillar {...pillar} userData={{ ...pillar.userData, setMovers, movers}} key={pillar.key}  /> )}
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

function AddPoint(props) {
  const [hovered, setHover] = useState(false)
  const [clicked, setClicked] = useState(false)
  const {row, col, userData: {key, movers, setMovers, addPoints, setAddPoints, getPillar, setPillars, pillars}} = props;
  const mesh = useRef();

  let handlePointerOver = (e) => setHover(true);
  let handlePointerOut = (e) => {if (!clicked) setHover(false);}
  useEffect(() => {
    const div = mesh.current;

    div.addEventListener('pointerout', handlePointerOut)
    // div.onPointerOver = handlePointerOver;
    // div.onPointerOver = handlePointerOver;
    return () => {
      console.log(div);
      // div._listeners = undefined;
      // throw new Error('yeet');
      // div.onPointerOut = null;

      // div.removeEventListener('pointerout', handlePointerOut)
      // div.removeEventListener('pointerout', handlePointerOver)
    };
  }, [])
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
