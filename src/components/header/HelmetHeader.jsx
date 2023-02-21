import { Helmet } from "react-helmet";

const HelmetHeader = ({title}) => {
    return <Helmet>
    <meta charSet="utf-8" />
    <title>Cryptolyzed | {title} | Blockchain Analytics</title>
  </Helmet>
}

export default HelmetHeader;