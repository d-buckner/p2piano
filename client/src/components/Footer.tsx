import {Flex, Link} from '@chakra-ui/react';

export default function Footer() {
    return (
        <Flex justifyContent='center'>
            <span>
                open to the public 7 days a week. made by {' '}
                <Link
                    textDecoration='underline'
                    href='https://github.com/d-buckner'
                >
                    d-buckner
                </Link>
            </span>
        </Flex>
    );
}
