import gql from 'graphql-tag'
    export default gql`
        query fetchTravel {
            fetchTravel {
                items {
                    id
                }
            }
        }`