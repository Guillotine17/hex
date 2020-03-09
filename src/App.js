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
  if (movers.length === 0) {
    const {position: [x, y, z], userData: {depth}, w, h} = props;
    setMovers([{
      key: 'yeet',
      position: [x + .5 * w, y + .5*h, depth + 1 + z]
    }]);
  } else {
    console.log('mover already exists!');
    const {position: [x, y, z], userData: {depth}, w, h} = props;
    setMovers([{
      key: 'yeet',
      position: [x + .5 * w, y + .5*h, depth + 1 + z]
    }]);    // new destination for active movers
  }
  // console.log(movers);
  
}


function App() {

  const pillars = [];
  const maxColumns = 15;
  const maxRows = 15;
  const [movers, setMovers] = useState([]);
  // const [springs, set, stop] = useSprings(number, index => ({position: [0, 0, 0]}))
  // const springs = useSprings(movers.length, movers.map(mover => { position: mover.position }));
  const [springs, setMoverPosition, stop] = useSprings(movers.length, mover => ({...mover, position: [0, 0, 0]}));

  // const transitions = useTransition(movers,  mover => mover.key, {
  //   from: { visibile: false, position:[0, 0, 0]},
  //   enter: { visibile: true, position: [...mover.position] },
  //   update: { visible: true, position: [...mover.position]},
  //   leave: { visible: false },
  // })

  for (let colIndex = 0; colIndex < maxColumns; colIndex++) {
    for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
      pillars.push({
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
        }
      });
    }    
  }
  return (
      <Canvas camera={{ fov: 100, position: [0, 0, 50] }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        { pillars.map(pillar => <HexPillar {...pillar} /> )}
        { movers.map(mover => <HexMover {...mover} /> )}
        {/* {springs.map((props, index) =>
          <animated.mesh key={index} {...props} >
            <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
            <meshStandardMaterial attach="material" color={'red'} />
          </animated.mesh>
        )} */}
        <CameraControls/>
      </Canvas>
  );
}
function CameraControls() {
  const { gl: { domElement }, camera } = useThree();
  useFrame(({ gl, scene, camera }) => gl.render(scene, camera), 1);
  return <orbitControls args={[camera, domElement]} />
}

// ReactDOM.render(
//   <Canvas>
//     <ambientLight />
//     <pointLight position={[10, 10, 10]} />
//   </Canvas>,
//   document.getElementById('root')
// )

export default App;
