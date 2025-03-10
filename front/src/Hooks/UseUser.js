import { decode } from "jsonwebtoken";
import { useCallback, useContext } from "react";
import { useDispatch } from "react-redux";
import loginService from '../Utils/LoginService'
import postCarrito from "../Utils/postCarrito";
import Cookies from "universal-cookie";
import createUserByGoogle from "../Utils/createUser/createUserByGoogle";
import getCart from "../Utils/getCart";
import usePath from "./UsePaths";

const cookies = new Cookies();


export default function useUser() {
    const dispatch = useDispatch();
    const { goBack } = usePath();
    let myStorage = window.localStorage;
    const login = useCallback((username, password) => {
        dispatch({ type: 'LOADING', payload: true })
        dispatch({ type: 'ERROR', payload: false })
        loginService(username, password)
        .then(async jwt => {
            let id_products = [];
            cookies.get('trolley')?.map(x => id_products.push({ id: x.id, quantity: x.quantity }));
            myStorage.setItem('jwt', jwt);
            goBack();
            console.log('hola')
            await postCarrito(jwt, id_products)
            .then(async (res) => {
                await getCart(jwt)
                window.location.href = '/';
            }).catch((err) => { console.error(err) })
            dispatch({ type: 'LOGIN', payload: jwt })
            var isadmin = decode(jwt)
            dispatch({ type: 'LOADING', payload: false })
            dispatch({ type: 'SET_LOGIN_USER', payload: isadmin.isAdmin })
            })
            .catch(err => { dispatch({ type: 'LOADING', payload: false }); alert(err); console.error(err) })
    }, []);

    const loginGoogle = useCallback(async (res) => {
        dispatch({ type: 'LOADING', payload: true })
        dispatch({ type: 'ERROR', payload: false })
        let id_products = [];
        cookies.get('trolley')?.map(x => id_products.push({ id: x.id, quantity: x.quantity }));
        myStorage.setItem('jwt', res.tokenId);
        const { googleId } = res.profileObj;
        await createUserByGoogle(googleId, res.tokenId)
        postCarrito(myStorage.getItem('jwt'), id_products)
        .then(async (res) => {
            await getCart(myStorage.getItem('jwt'));
        }).catch((err) => { console.error(err) })
        .then((response) => {
            dispatch({ type: 'LOGIN', payload: myStorage.getItem('jwt') });
            dispatch({ type: 'LOADING', payload: false })
            window.location.href = '/';
            })
            .catch((err) => {
                alert('Algo salio mal' + '\nEse usuario ya fue registrado en nuestra plataforma, prueba iniciar sesion con contraseña');
                console.error(err);
                myStorage.setItem('jwt', '');
                dispatch({ type: 'LOADING', payload: false });
            })
    })

    const logout = useCallback(() => {
        console.log('deslogueado con exito')
        myStorage.setItem('jwt', '');
        cookies.set('trolley', [])
        dispatch({ type: 'REMOVE_ALL_FAVS' })
        dispatch({ type: 'LOGOUT' })
        window.location.href = '/';
    }, []);
    return {
        login,
        loginGoogle,
        logout
    }
}