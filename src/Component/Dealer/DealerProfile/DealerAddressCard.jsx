import React from 'react'

// css
import "../../../Css/UserAddressCard.css";

const UserAddressCard = (props) => {
  return (
    <>
      <div className="user__area__card">
        <p>
          Address : <span>{props.area}</span>
        </p>
        <p>
          Area : <span>{props.address_area}</span>
        </p>
        <p>
          Landmark : <span>{props.landmark}</span>
        </p>
        <p>
          City : <span>{props.city}</span>
        </p>
        <p>
          State : <span>{props.state}</span>
        </p>
        <p>
          Country : <span>{props.country}</span>
        </p>
        <p>
          Pincode : <span>{props.pincode}</span>
        </p>
        {props.digipin_data && (
          <p>
            Digipin : <span>{props.digipin_data}</span>
          </p>
        )}
        {/* <p>
          Default : <span>{props.default}</span>
        </p> */}

        <div className="address__card__buttons">
          <button onClick={props.updateArea}>Update</button>
          <button onClick={props.deleteArea}>Delete</button>
        </div>
      </div>
    </>
  )
}

export default UserAddressCard
