import gql from 'graphql-tag'
    export default gql`
        mutation deleteTravel($id: ID!){
            deleteTravel(
                input: {
                    id: $id
                }
            )  {
                id
            } 
        }`