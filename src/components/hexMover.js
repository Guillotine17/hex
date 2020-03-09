import React, {useState, useRef} from 'react';
import * as THREE from 'three';
import {useSpring, animated} from 'react-spring'
import { useFrame } from 'react-three-fiber'


function HexMover(props) {
  console.log('ITS HAPPENING');
  // Set up state for the hovered and active state
  // const [hovered, setHover] = useState(false)
  // const [active, setActive] = useState(false)
  // const [position, setPosition] = useState(position)
  const mesh = useRef()

  const [position, set] = useState({x: props.position[0], y:props.position[1], z:props.position[2]});
  console.log('input props:', props);
  const [x, y, z] = props.position;
  if (x !== position.x || y !== position.y || z !== position.z) {
    console.log('setting');
    set({x, y, z});
    // apset({x, y, z})
  }
  const {ax, ay, az} = useSpring({to: {ax: position.x, ay: position.y, az: position.z}, from: {ax: 0, ay: 0, az: 0}});
  console.log('position', {ax, ay, az});
  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    mesh.current.position.x = ax.value;
    mesh.current.position.y = ay.value;
    mesh.current.position.z = az.value;
  })
  // console.log('animatedProps', animatedProps);
  
  return (
      <mesh
        ref={mesh}
        visible
      >
        <sphereBufferGeometry attach="geometry" args={[2, 2, 2]} />
        <meshStandardMaterial attach="material" color={'green'} />
      </mesh>
    )
}

export { HexMover }
