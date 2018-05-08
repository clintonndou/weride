import gql from 'graphql-tag'
    export default gql`
        query fetchTravel($sub: String!) {
            fetchTravel(sub: $sub) {
                items {
                    id
                    from
                    to
                    date
                }
            }
        }`