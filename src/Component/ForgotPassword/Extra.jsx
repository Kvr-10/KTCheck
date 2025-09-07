import React from 'react'
import { useParams } from 'react-router-dom'
import ForgetLinkStep1 from './ForgetLinkStep1';

const Extra = () => {

    const { utype, uid, token } = useParams();
    return (
        <>
            {/* <NavLink to={url}>Extra</NavLink> */}
            <ForgetLinkStep1 utype={utype} token={token} id={uid} />
        </>
    )
}

export default Extra