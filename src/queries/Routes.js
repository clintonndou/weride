import gql from 'graphql-tag'
    export default gql`
        query fetchRoutes($location: String!, $destination: String!) {
            fetchRoutes(location: $location, destination: $destination) {
                items {
                    id
                    from
                    to
                    taxiType
                    routeLocation
                    price
                }
            }
        }`