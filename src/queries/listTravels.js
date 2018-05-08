import gql from 'graphql-tag'
    export default gql`
        query listTravels {
            listTravels {
                items {
                    id
                    from
                    to
                    date
                }
            }
        }`