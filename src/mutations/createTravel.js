import gql from 'graphql-tag'
    export default gql`
        mutation createTravel($id: ID!, $from: String!, $to: String!, $sub: String!, $date: String!){
            createTravel(
                input: {
                    id: $id, from: $from, to: $to, sub: $sub, date: $date
                }
            )  {
                id
                from
                to
                date
            } 
        }`