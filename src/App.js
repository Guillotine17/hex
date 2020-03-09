import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree, extend } from 'react-three-fiber'
import HexPillar from './components/hexPillar';
import { HexMover } from './components/hexMover';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three';
import {useSprings, animated} from 'react-spring'

// import ReactDOM from 'react-dom'

import './App.css';

extend({ OrbitControls })

function pillarClicked(props) {
  console.log(props);
  const { movers, setMovers, setMoverPosition } = props.userData;
  const {position: [x, y, z], userData: {pillarHeight}, w, h} = props;
  if (movers.filter(mover => mover && mover.active).length === 0) {
    setMovers([...movers, {
      key: movers.length + 1,
      active: true,
      position: [x + .5 * w, y + .5*h, pillarHeight + 1 + z]
    }]);
    console.log('position: ', [x + .5 * w, y + .5*h, pillarHeight + 1 + z]);
  } else {
    setMovers(movers.map((mover) => ({ ...mover, position: mover.active? [x + .5 * w, y + .5*h, pillarHeight + 1 + z] : mover.position})));
  }
  console.log('after set movers', movers);
}


function App() {
  const [movers, setMovers] = useState([]);
  // const [springs, setMoverPosition] = useSprings(movers.length, mover => ({...mover, position: mover.position}));
  let pillars = getPillars(setMovers, ()=>{}, movers);

  return (
    <>
      <Canvas camera={{ fov: 100, position: [0, 0, 50] }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        { pillars.map(pillar => <HexPillar {...pillar} /> )}
        { movers.map(mover => <HexMover key={mover.key} {...mover} /> )}

        <CameraControls/>
      </Canvas>
      <div style={{position: 'absolute', top: '0px', right: '0px'}} >
        {movers.map(mover =>
          <div>
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
          <button onClick={ e=> spawnMover(movers, setMovers)}> + </button>
        </div>
      </div>
      {/* <div style={{position: 'absolute', top: '0px', left: '0px', color: 'white'}}>
        {springs.map((props) =>
            <animated.div key={props.key}>
              <div>
                {props.position[0]}
              </div>
            
            </animated.div>
          )}
      </div> */}
    </>
  );
}
function spawnMover(movers, setMovers) {
  let tempMovers = movers.map(mover => ({...mover, active: false}));
  tempMovers = [...tempMovers, {
    key: movers.length + 1,
    active: true,
    position: [6, 6, 6]
  }];
  setMovers(tempMovers);

}
function CameraControls() {
  const { gl: { domElement }, camera } = useThree();
  useFrame(({ gl, scene, camera }) => gl.render(scene, camera), 1);
  return <orbitControls args={[camera, domElement]} />
}

function getPillars(setMovers, setMoverPosition, movers) {
  const maxColumns = 10;
  const maxRows = 10;
  const retval = []
  for (let colIndex = -maxColumns/2; colIndex < maxColumns/2; colIndex++) {
    for (let rowIndex = -maxRows/2; rowIndex < maxRows/2; rowIndex++) {
      retval.push({
        key: 'col' + colIndex + 'row' + rowIndex,
        // position: [colIndex, 0, rowIndex ],
        userData: {
          column: colIndex,
          row: rowIndex,
          depth: rowIndex + colIndex,
          pillarClicked: pillarClicked,
          setMovers: setMovers,
          setMoverPosition:setMoverPosition,
          movers,
          pillarHeight: Math.abs(rowIndex) + Math.abs(colIndex)
        }
      });
    }    
  }
  return retval;
}
export default App;
