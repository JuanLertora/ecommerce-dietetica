import React, { useEffect, useState, useContext } from 'react';
import './formbefore.css'
import NavBar from './NavBar';
import { getAddress, postAddress, sendIdAddress, deleteAddress, sendIdStore } from '../Actions';
// import emptycart from '../../Utils/emptycart';
import { StyleSharp } from '@material-ui/icons';
import Cookies from "universal-cookie";
import { useDispatch, useSelector } from "react-redux";
import { DataContext } from "../Contexts/DataProvider"
import getCart from "../Utils/getCart";
import axios from 'axios'
import { useHistory } from "react-router";
import swal from "sweetalert";
import { Link, NavLink } from 'react-router-dom';
import Calendar from './Calendar';
import { decode } from "jsonwebtoken";
import AddressCard from './AddressCard';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import { Select } from '@material-ui/core';

export default function Pending() {
  const { isLogin } = useSelector(state => state.cart)
  const [sucuSelected, setSucuSelected] = useState('Centro Córdoba')
  const [idSelected, setIdSelected] = useState(2)
  const myStorage = window.localStorage;
  const value = useContext(DataContext)
  const [carrito, setCarrito] = value.carrito;
  const [total, setTotal] = value.total;
  const [menu, setMenu] = value.menu;
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  useEffect(() => {
    if (!!myStorage.getItem('jwt')) {
      getCart(myStorage.getItem('jwt'));
    }

    else {
      history.push('/')

    }
  }, [isLogin])

  const [addressid, setAddressId] = useState(null)
  const [sucursal, setSucursal] = useState([]);

  function validateForm(input) {
    let errors = {};
    if (!input.calle) {
      errors.calle = "Escribe una calle";
    } else {
      errors.calle = "";
    }
    if (!input.altura) {
      errors.altura = "Escribe una altura";
    } else if (!/\d{1,2} - \d{1,2}/g.test(input.altura)) {
      errors.altura =
        "La altura deben ser un máximo de 6 dígitos";
    } else {
      errors.altura = "";
    }
    if (!input.barrio) {
      errors.barrio = "Escribe un barrio";
    } else {
      errors.barrio = "";
    }
    if (!input.otros) {
      errors.otros = "Escribe datos adicionales de dirección";
    } else {
      errors.otros = "";
    }
    if (!input.codigo) {
      errors.codigo = "Escribe un código postal";
    } else if (!/\d{1,2} - \d{1,2}/g.test(input.codigo)) {
      errors.codigo =
        "El código postal no debe ser mayor a 10 dígitos";
    } else {
      errors.codigo = "";
    }

    if (!input.numero) {
      errors.numero = "Escribe un número de teléfono";
    } else if (!/\d{1,2}-\d{1,2}/g.test(input.numero)) {
      errors.numero =
        "Escribe un teléfono con prefijo válido";
    } else {
      errors.numero = "";
    }

    return errors;
  };
  function handleInput(e) {
    setInput({
      ...input,
      [e.target.name]: e.target.value
    })
    setErrors(
      validateForm({
        ...input,
        [e.target.name]: e.target.value,
      })
    );
  }
  // ----------------------------------------------------------------------

  function onFocus(ev) {
    setTouched({
      ...touched,
      [ev.target.name]: true,
    });
  }


  let [input, setInput] = useState({
    calle: ' ',
    altura: ' ',
    barrio: ' ',
    otros: ' ',
    codigo: ' ',
    numero: ' ',
  })

  // function handleAdress(event) {
  //     setInput({
  //         ...input,
  //         [event.target.name]: event.target.value
  //     })
  // }
  const jwt = window.localStorage.jwt
  var client = decode(jwt)
  var id = client?.id
  const dispatch = useDispatch();
  useEffect(() => {
    const jwt = myStorage.getItem("jwt")
    dispatch(getAddress(jwt, id))

  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!input.calle || !input.altura || !input.barrio || !input.otros || !input.codigo || !input.numero) { swal("Error", "Debe llenar todos los campos", "error") }
    else {
      const jwt = myStorage.getItem("jwt");
      console.log(jwt)
      dispatch(postAddress(input, jwt))
      swal("Creado", "Dirección cargada con éxito!", "success")
       window.location.reload()
    }
  }

  function calenSubmit(event){
    event.preventDefault()
    if(!errorsForm)
    return swal("Creado", "Turno asignado con éxito!", "success")
    return swal("Creado", "No pudimos agendar tu turno, por favor slecciona una fecha valida", "error")
  }

  useEffect(() => {
    axios.get('/sucursal').then(function (response) {
      setSucursal(response.data.data);
    })
  }, [])

  let { token, comodin, addresses, errorsForm } = useSelector(state => state.reducerPablo)
  const cookies = new Cookies();

  function handleSetAddress(e) {
    const jwt = myStorage.getItem("jwt");
    const { value } = e.target
    if(value){
      dispatch({type: 'SET_EERORS_FORM', payload: ''})
    }
    setAddressId(value)
    dispatch(sendIdAddress(value, jwt))
  }



  useEffect(() => { }, [payment]);
  useEffect(() => {
    let jwt = window.localStorage.getItem('jwt');
    if (!!jwt)
      getCart(jwt)
  }, [comodin])
  const history = useHistory();
  async function handleCompra(event) {
    event.preventDefault();
    if(!errorsForm){
    let el = document.getElementById('exampleRadios1')
    if (el?.checked)
      dispatch(sendIdStore(idSelected, myStorage.getItem('jwt')))
    console.log('elemnto', el?.checked)
    var data = JSON.stringify({
      "payment": "mercadopago"
    });

    var config = {
      method: 'post',
      url: '/payment',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      data: data
    };

    axios(config)
      .then(function (response) {
        window.location.replace(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
}
  }
  async function payment(token) {
    var data = JSON.stringify({
      "payment": "mercadopago"
    });

    var config = {
      method: 'post',
      url: '/payment',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        return (JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
  }


  useEffect(() => {
    if (isLogin) {
      let jwt = window.localStorage.getItem('jwt');
      if (!!jwt)
        getCart(jwt)
    }
  }, [isLogin])

  function handleInputSucu(e) {
    e.preventDefault();
    const { value } = e.target;
    setSucuSelected(value)
    setIdSelected((sucursal?.find(x => x.name === value))?.id)
  }

  function handleSelect(e) {
    dispatch({type: 'SET_EERORS_FORM', payload: 'Deves volver a ingresar un horario si todavia no lo has hecho'})
    if (e.target.value !== 'retiro en sucursal') {

    }
  }




  if (addresses.length > 0) {
    return (
      <div>
        <NavBar />
        <Container className="Container-Envio" >
          <Row className="row-envios">
            <Col xs="12" md="6" className="retiro-domicilio">
              <Card className="card-domicilio">
                <Card.Body className="retiro-Body">
                  <div className="body-domicilio">
                    {addresses && addresses?.map(address => {
                      return (
                        <div class="form-check">
                          <input class="form-check-input" type="radio" name="exampleRadios2" id={"domicilio: " + address.id} value={address.id} onClick={handleSetAddress} ></input>
                          <label class="form-check-label" for="exampleRadios2">
                            Envío a domicilio:
                          </label>
                          <AddressCard address={address} />
                        </div>
                      )
                    })}
                    <div>
                      <NavLink to='/newaddress'><button class="btn btn-primary">Añadir nueva dirección</button></NavLink>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xs="12" md="6" className="retiro-domicilio">
              <Card className="card-domicilio">
                <Card.Body className="retiro-Body">

                  <input class="form-check-input" type="radio" name="exampleRadios2" id="exampleRadios1" value={'retiro en sucursal'} defaultChecked onClick={handleSelect} ></input>
                  <label class="form-check-label" for="exampleRadios2">
                    Retiro en local:
                  </label>
                  <iframe id="map" src={(sucursal?.find(x => x.name === sucuSelected))?.src} width="480" height="250" loading="lazy"></iframe>
                  <h4>Seleccione una sucursal:</h4>
                  {/* a medida que selecciona el usuario ve lo que selecciona */}
                  <select name="types" onChange={handleInputSucu}>
                    <option value='Centro Córdoba'>Seleccionar sucursal</option>
                    {sucursal?.map(sucu => {
                      return <option value={sucu.name}>{sucu.name}</option>
                    })}
                  </select>
                  <h4>Por favor seleccione fecha y horario que va a retirar:</h4>
                  <span class="calendar">
                    <Calendar></Calendar>
                    </span>
                    {errorsForm?<p style={{color: 'red'}}>{errorsForm}</p>:<br/>}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* <p>Dirección: Rivadavia 29. Plaza San Martin </p> */}

          <div class="d-grid gap-2 col-3 mx-auto" className="btns-envio">
            <div class="form-check form-check-inline" className="btnEmail">
              <input class="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1"></input>
              <label class="form-check-label" for="inlineCheckbox1">Quiero notificación vía mail de mi pedido</label>
            </div>
            <div className="btnComprar">
            <button type="button" style={errorsForm?{backgroundColor: 'red'}:{}} class="btn btn-success" onClick={handleCompra}>Comprar</button>
              {/* <button class="btn btn-primary" color="green" type="button">Comprar</button> */}
              <button type="button" class="btn btn-dark" onClick={() => { setMenu(true) }} >Volver al carrito</button>
            </div>
          </div>

        </Container>
      </div>
    )
  } else {
    return (
      <div>
        <NavBar />
        {/* <div className={Styles.div}> */}
        {/* <div>
            <h1>Gracias Por tu compra Aguardamos tu pago nomas </h1>
            </div> */}

        {/* 
        </div> */}
        <div className="ultimo-paso">
          <h1 >¡Último paso! </h1>
          <h5>Por favor seleccione: </h5>
        </div>
        <Container className="Container-Envio" >
          <Row >
            <Col xs="12" md="6" className="retiro-domicilio">
              <Card className="card-domicilio">
                <Card.Body className="retiro-Body">
                  <div class="form-check form-check-inline">
                    <div class="form-check">
                      <label class="form-check-label" for="exampleRadios2">
                        Envío a domicilio:
                      </label>
                    </div>
                  </div>


                  <form>
                    <div class="form-row">
                      <div>
                        <label for="inputCity">Calle:</label>
                        <input
                          type="text"
                          class="form-control"
                          name="calle"
                          // a todos los input le pongo handleInput para que vaya al estado
                          onChange={handleInput}
                          required='required'
                          onFocus={onFocus}
                          value={input.calle}
                        ></input>
                        {errors.calle && touched.calle && (
                          <p>{errors.calle}</p>
                        )}

                        {/* <input type="text" class="form-control" name='calle' value={input.calle} onChange={handleAdress} ></input> */}
                      </div>
                      <div >
                        <label for="inputCity">Altura:</label>
                        <input
                          type="text"
                          class="form-control"
                          name="altura"
                          // a todos los input le pongo handleInput para que vaya al estado
                          onChange={handleInput}
                          required='required'
                          onFocus={onFocus}
                          value={input.altura}
                        ></input>
                       

                        {/* 
      <input type="text" class="form-control" name='altura' value={input.altura} onChange={handleAdress} ></input> */}
                      </div>
                      <div class="form-group col-xs-12">
                        <label for="inputCity">Barrio:</label>
                        <input
                          type="text"
                          class="form-control"
                          name="barrio"
                          // a todos los input le pongo handleInput para que vaya al estado
                          onChange={handleInput}
                          required='required'
                          onFocus={onFocus}
                          value={input.barrio}
                        ></input>
                        {errors.barrio && touched.barrio && (
                          <p >{errors.barrio}</p>
                        )}
                        {/* <input type="text" class="form-control" name='barrio' value={input.barrio} onChange={handleAdress}  ></input> */}
                      </div>
                      <div class="form-group col-xs-12">
                        <label for="inputZip">Otros:</label>
                        <input
                          type="text"
                          class="form-control"
                          name="otros"
                          // a todos los input le pongo handleInput para que vaya al estado
                          onChange={handleInput}
                          required='required'
                          onFocus={onFocus}
                          value={input.otros}
                        ></input>
                        {errors.otros && touched.otros && (
                          <p >{errors.otros}</p>
                        )}
                        {/* <input type="text" class="form-control" name='otros' value={input.otros} onChange={handleAdress} ></input> */}
                      </div>
                      <div class="form-group col-xs-12">
                        <label for="inputZip">Código postal:</label>
                        <input
                          type="number"
                          class="form-control"
                          name="codigo"
                          // a todos los input le pongo handleInput para que vaya al estado
                          onChange={handleInput}
                          required='required'
                          onFocus={onFocus}
                          value={input.codigo}
                        ></input>
                        {errors.codigo && touched.codigo && (
                          <p >{errors.codigo}</p>
                        )}
                        {/* <input type="text" class="form-control" name='codigo' value={input.codigo} onChange={handleAdress}  ></input> */}
                      </div>
                      <div class="form-group col-xs-12">
                        <label for="inputCity">Número de contacto:</label>
                        <input
                          type="number"
                          class="form-control"
                          name="numero"
                          // a todos los input le pongo handleInput para que vaya al estado
                          onChange={handleInput}
                          required='required'
                          onFocus={onFocus}
                          value={input.numero}
                        ></input>
                        
                        {/* <input type="text" class="form-control" name='numero' value={input.numero} onChange={handleAdress} ></input> */}
                      </div>
                    </div>
                  </form>
                  <div className="btn-Cargar">
                    <button type="submit" class="btn btn-primary" onClick={handleSubmit}>Cargar</button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xs="12" md="6" className="retiro-local">
              <Card className="card-retiro">
                <Card.Body>
                  <div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios1" value="retiro en sucursal" onClick={handleSelect} defaultChecked></input>
                      <label class="form-check-label" for="exampleRadios1">
                        Retiro en local:
                      </label>
                    </div>

                     <iframe id="map" src={(sucursal?.find(x => x.name === sucuSelected))?.src} width="480" height="250" loading="lazy"></iframe>
                    <h4 class="sucu2">Seleccione una sucursal:</h4>
                    <div >
                      <p></p>
                      {/* a medida que selecciona el usuario ve lo que selecciona */}
                      <div class="sucuu">
                      <select name="types" onChange={handleInputSucu} >
                        <option value='Centro Córdoba'>Seleccionar sucursal</option>
                        {sucursal?.map(sucu => {
                          return <option value={sucu.name}>{sucu.name}</option>
                        })}
                      </select>
                    </div>
                    </div>
                    <br/>

                    {/* <p>Dirección: Rivadavia 29. Plaza San Martin </p> */}

                    <h4>Seleccione fecha y horario que va a retirar:</h4>
                    <span class="calendar">
                    <Calendar></Calendar>
                    </span>
                    {errorsForm?<p style={{color: 'red'}}>{errorsForm}</p>:<br/>}
                    <div className="btn-Cargar">
                    <button type="submit" class="btn btn-primary" onClick={calenSubmit}>Cargar</button>
                  </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div class="d-grid gap-2 col-3 mx-auto" className="btns-envio">
            <div class="form-check form-check-inline" className="btnEmail">
              <input class="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1"></input>
              <label class="form-check-label" for="inlineCheckbox1">Quiero notificación vía mail de mi pedido</label>
            </div>
            <div className="btnComprar">
              <button type="button" style={errorsForm?{backgroundColor: 'red'}:{}} class="btn btn-success" onClick={handleCompra}>Comprar</button>
              {/* <button class="btn btn-primary" color="green" type="button">Comprar</button> */}
              <button type="button" class="btn btn-dark" onClick={() => { setMenu(true) }} >Volver al carrito</button>
            </div>

          </div>
        </Container>
      </div>
    )


  }
}