import { useEffect, useState } from 'react'
import BarcodeScanner from './camera'
import OrderDetails from './orderDetails'
import ItemList from './itemList'
import Buttons from './buttons'
import TextBox from './textbox'
import BagId from './bagId'
import '../App.css'



function Home() {


  return (
    <>
        <BarcodeScanner/> 
        <BagId/>
        <OrderDetails/>
        <ItemList/>
        <TextBox/>  
        <Buttons/>
    </>
  )
}

export default Home
