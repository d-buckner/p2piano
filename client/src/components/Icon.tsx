const ASSETS_PATH = '/assets/img';
const FILETYPE = 'svg';

type Props = {
  name: string,
};

export default function Icon(props: Props) {
  return <img src={getIconPath(props.name)} alt={props.name} width="16" height="16" />;
}

function getIconPath(iconName: string): string {
  return `${ASSETS_PATH}/${iconName}.${FILETYPE}`;
}
