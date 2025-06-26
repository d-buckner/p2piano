import {Flex, Link} from '@chakra-ui/react';


export default function Footer() {
    return (
        <Flex justifyContent='center'>
            <span>
                open to the public 7 days a week. made by {' '}
                <Link
                    textDecoration='underline'
                    href='https://d-buckner.org'
                >
                    d-buckner
                </Link>
            </span>
        </Flex>
    );
}
