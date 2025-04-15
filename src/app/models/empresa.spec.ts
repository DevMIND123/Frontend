import { Empresa } from './empresa';

describe('Empresa', () => {
    it('should create an instance', () => {
        const empresa = new Empresa();
        expect(empresa).toBeTruthy();
    }); // Cierra el bloque it
}); // Cierra el bloque describe