import React, {useState, useRef} from 'react';
import * as THREE from 'three';
import {useSpring, animated, config} from 'react-spring'
import { useFrame } from 'react-three-fiber'

function HexMover(props) {
  const mesh = useRef()
  const [position, set] = useState({x: props.position[0], y:props.position[1], z:props.position[2]});
  const [x, y, z] = props.position;
  if (x !== position.x || y !== position.y || z !== position.z) {
    set({x, y, z});
  }
  const {ax, ay, az} = useSpring({to: {ax: position.x, ay: position.y, az: position.z}, from: {ax: 0, ay: 0, az: 0}, config: config.gentle});
  useFrame((state) => {
    mesh.current.position.x = ax.value;
    mesh.current.position.y = ay.value;
    mesh.current.position.z = az.value;
  })
  
  return (
      <mesh
        ref={mesh}
        visible
      >
        <sphereBufferGeometry attach="geometry" args={[2, 32, 32]} />
        <meshStandardMaterial attach="material" color={props.color ? props.color : 'green'} />
      </mesh>
    )
}

export { HexMover }
