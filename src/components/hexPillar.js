import React, { useState, useMemo } from 'react';
import * as THREE from 'three';
import { HEX_SIZE, HEX_W, HEX_H, HEX_POINTS } from '../constants';

import { messageService } from '../services/messageService';


function getPosition(row, col) {
    const padding = 0;
    let x = 0;
    if (row % 2) {
        x += 0.5 * HEX_W;
    }
    x += col * HEX_W;
    x += col * padding;
    let y = .75 * row * HEX_H;
    y += row * padding;
    return [x, y, 0];
}
function HexPillar(props) {
    const { userData: { midiPad, mode, pillarHeight, addPoints, setAddPoints, setPillars, pillars, getAddPoint, row, column, key } } = props;
    const shape = useMemo(() => {
        var hexFaceShape = new THREE.Shape();
        hexFaceShape.moveTo(0, 0.75 * HEX_H)
        hexFaceShape.lineTo(0.5 * HEX_W, HEX_H)
        hexFaceShape.lineTo(HEX_W, 0.75 * HEX_H)
        hexFaceShape.lineTo(HEX_W, 0.25 * HEX_H)
        hexFaceShape.lineTo(0.5 * HEX_W, 0)
        hexFaceShape.lineTo(0, 0.25 * HEX_H)
        hexFaceShape.lineTo(0, 0.75 * HEX_H)
        return hexFaceShape;
    }, [])
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)
    const [clicked, setClicked] = useState(false)
    const [midiVelocity, setMidiVelocity] = useState(pillarHeight)
    const { userData } = props;
    const messageSubscription = messageService.getMessage().subscribe(({ text }) => {
        if (text.pad === midiPad) {
            setMidiVelocity(text.vel);
        }
    });
    const handlePointerOver = (e) => setHover(true);
    const handlePointerOut = (e) => { if (!clicked) setHover(false); }
    function convertToAddPoint() {
        setAddPoints([...addPoints, getAddPoint({ rowIndex: row, colIndex: column, position: getPosition(row, column) })]);
        setPillars(pillars.filter((pillar) => pillar.key !== key));
    }
    function handleOnClick(e) {
        // convert to addpoint
        if (mode === 'EDIT') {
            setClicked(true);
            // messageSubscription
            convertToAddPoint();
        } else {
            // send mover here/generate mover
            console.log('MIDI VELOCITY' + midiVelocity);
            props.userData.pillarClicked({ ...props, ...userData, midiVelocity, position }, e);
        }
    }

    const position = getPosition(props.userData.row, props.userData.column);
    return (
        <mesh
            {...props}
            scale={(hovered && active) ? [1, 1, 1] : [.8, .8, .8]}
            visible={!active || hovered}
            position={position}
            midiVelocity={ midiVelocity }
            rotation={[0, 0, 0]}
            onClick={handleOnClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            <meshStandardMaterial attach="material" color={hovered ? 'hotpink' : 'orange'} />
            <extrudeGeometry attach="geometry" args={[shape, {
                bevelEnabled: false, steps: 2,
                depth: midiVelocity
            }]}>
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

function getPillars() {
    const maxColumns = 4;
    const maxRows = 4;
    const retval = []
    let i = 88;
    for (let row = -maxRows / 2; row < maxRows / 2; row++) {
        for (let col = -maxColumns / 2; col < maxColumns / 2; col++) {
            retval.push(getPillar({ row, col, midiPad:i}));
            i = i + 1;
        }
    }
    return retval;
}
function getPillar({ row, col, midiPad}) {
    return {
        key: 'col' + col + 'row' + row,
        position: getPosition(row, col),
        userData: {
            column: col,
            row: row,
            depth: row + col,
            pillarHeight: Math.abs(row) + Math.abs(col),
            pillarClicked,
            midiPad,
        }
    }
}
function pillarClicked(props) {
    console.log(props);
    const { movers, setMovers } = props.userData;
    const { position: [x, y, z], userData: { pillarHeight }, midiVelocity } = props;
    if (movers.filter(mover => mover && mover.active).length === 0) {
        setMovers([...movers, {
            key: movers.length + 1,
            active: true,
            position: [x + .5 * HEX_W, y + .5 * HEX_H, midiVelocity + 1 + z]
        }]);
        console.log('position: ', [x + .5 * HEX_W, y + .5 * HEX_H, midiVelocity + 1 + z]);
    } else {
        setMovers(movers.map((mover) => ({ ...mover, position: mover.active ? [x + .5 * HEX_W, y + .5 * HEX_H, pillarHeight + 1 + z] : mover.position })));
    }
    console.log('after set movers', movers);
}
export { HexPillar, getPillars, getPosition, getPillar }