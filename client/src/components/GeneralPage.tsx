import { Grid, GridItem } from '@chakra-ui/react'
import Navbar from '../components/Navbar';
import Footer from './Footer';

import type { ReactNode } from 'react';


type Props = {
    children: ReactNode,
}

const GeneralPage = ({ children }: Props) => (
    <Grid
        templateAreas={`"header""main""footer"`}
        gridTemplateRows='32px minmax(0, 1fr) 32px'
        height='100%'
        backgroundColor='background'
        color='foreground'
    >
        <GridItem area='header' as='nav'>
            <Navbar />
        </GridItem>
        <GridItem area='main' as='main'>
            {children}
        </GridItem>
        <GridItem area='footer' as='footer'>
            <Footer />
        </GridItem>
    </Grid>
);

export default GeneralPage;
