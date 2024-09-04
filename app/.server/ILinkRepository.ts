import { Link } from './Link';

//repository

export interface ILinkRepository {
    save(link: Link): Promise<void>;
    load(key: string): Promise<Link>;
}
