import { useState } from 'react'
import BarcodeScanner from './components/camera'
import OrderDetails from './components/orderDetails'
import ItemList from './components/itemList'
import Buttons from './components/buttons'
import TextBox from './components/textbox'
import './App.css'

import {
  RecoilRoot
} from 'recoil';

function App() {
  const [count, setCount] = useState(0)

  return (
    <RecoilRoot>
        <BarcodeScanner/> 
        <OrderDetails/>
        <ItemList/>
        <TextBox/>  
        <Buttons/>
    </RecoilRoot>
  )
}

export default App
