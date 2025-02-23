import {Grid, GridItem} from '@chakra-ui/react'
import Navbar from '../components/Navbar';
import {ReactNode} from 'react';
import Footer from './Footer';

type Props = {
    children: ReactNode,
}

const GeneralPage = ({children}: Props) => (
    // @ts-ignore type union to complex
    <Grid
        templateAreas={`
            "header"
            "main"
            "footer"
        `}
        gridTemplateRows='32px minmax(0, 1fr) 32px'
        height='100%'
        backgroundColor='ghostwhite'
    >
        <GridItem area='header'>
            <Navbar />
        </GridItem>
        <GridItem area='main'>
            {children}
        </GridItem>
        <GridItem area='footer'>
            <Footer />
        </GridItem>
    </Grid>
);

export default GeneralPage;
