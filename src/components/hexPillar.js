import React, {useState} from 'react';
import * as THREE from 'three';


const size = 4;
const w = Math.sqrt(3) * size
const h = 2 * size

function getPosition(row, col) {
    const padding = 0;
    let x = 0;
    if (row%2) {
        x += 0.5 * w;
    }
    x += col * w;
    x += col * padding;
    let y = .75 * row * h;
    y += row * padding;
    return [x, y, 0];
}
function HexPillar(props) {

    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)
    var hexFaceShape = new THREE.Shape();
    hexFaceShape.moveTo(0, 0.75 * h)
    hexFaceShape.lineTo(0.5 * w, h)
    hexFaceShape.lineTo(w, 0.75 * h)
    hexFaceShape.lineTo(w, 0.25 *h)
    hexFaceShape.lineTo(0.5 * w, 0)
    hexFaceShape.lineTo(0, 0.25 * h)
    hexFaceShape.lineTo(0, 0.75 * h)
    const { userData: { depth } } = props;
    // props.position = getPosition(props.userData.row, props.userData.column);
    // var geometry = new THREE.Geometry();

    // geometry.vertices = hexVertices;

    // geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );

    // geometry.computeBoundingSphere();
    const position = getPosition(props.userData.row, props.userData.column);
    return (
        <mesh
            {...props}
            scale={(hovered && active) ? [1, 1, 1] : [.8, .8, .8]}
            visible={!active || hovered}
            position={new THREE.Vector3(...position)}
            // userData={{ test: 'hello' }}
            rotation={new THREE.Euler(0, 0, 0)}
            onClick={e => { 
                // if (!hovered) return
                // setActive(!active);
                // if (!active) setHover(false);
                props.userData.pillarClicked({...props, position, w, h}, e);
            }}
            onPointerOver={e => {
                setHover(true)
            }}
            onPointerOut={e => setHover(false)}
        >
            <meshStandardMaterial attach="material" color={hovered ? 'hotpink' : 'orange'} />
            <extrudeGeometry attach="geometry" args={[hexFaceShape, { bevelEnabled: false, steps: 2,
	depth: depth }]}>
                {/* <vector3 attach="vertices" args={[0, 0, 0.75 * h]}/>
                <vector3 attach="vertices" args={[0.5 * w, 0, h]}/>
                <vector3 attach="vertices" args={[w, 0, 0.75 * h]}/>
                <vector3 attach="vertices" args={[w, 0, 0.25 *h]}/>
                <vector3 attach="vertices" args={[0.5 * w, 0, 0]}/>
                <vector3 attach="vertices" args={[0, 0, 0.25 * h]}/> */}
                {/* <THREE.face3 attach="faces"/> */}
            </extrudeGeometry>
        </mesh>
    )
}
 
export default HexPillar