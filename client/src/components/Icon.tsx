const ASSETS_PATH = '/assets/img';
const FILETYPE = 'svg';

type Props = {
  name: string,
};

export default function Icon({ name }: Props) {
  return <img src={getIconPath(name)} alt={name} width="16" height="16" />;
}

function getIconPath(iconName: string): string {
  return `${ASSETS_PATH}/${iconName}.${FILETYPE}`;
}
