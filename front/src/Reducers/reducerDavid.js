

const InitialState = {
    products: [],
}



export default function reducerDavid(state = InitialState, action) {

    switch (action.type) {
        case 'POST_PRODUCTS':
            return {
                ...state,};
            
        default:
            return {...state}
    }
}