import { IApplicationRepository } from '../../repositories/ApplicationRepository/IApplicationRepository';
import { IPurchaseRepository } from '../../repositories/PurchaseRepository/IPurchaseRepository';
import { ApplicationStatus, ApplicationEntity } from '../../entities/ApplicationEntity';
import { PurchaseEntity } from '../../entities/PurchaseEntity';
import { NotFoundError, BadRequestError } from '../../../errors/HttpError';
import { CreateApplicationDto } from '../../repositories/ApplicationRepository/dto/CreateApplicationDto';

export class ApplicationService {
    constructor(
        private readonly applicationRepository: IApplicationRepository,
        private readonly purchaseRepository: IPurchaseRepository
    ) {}

    async getAll(): Promise<ApplicationEntity[]> {
        return this.applicationRepository.findAll();
    }

    async create(dto: CreateApplicationDto): Promise<ApplicationEntity> {
        return this.applicationRepository.create(dto);
    }

    async assignManager(applicationId: number, managerId: number): Promise<ApplicationEntity> {
        const application = await this.applicationRepository.findById(applicationId);
        if (!application) {
            throw new NotFoundError('Заявка не найдена');
        }

        const updated = await this.applicationRepository.update(applicationId, { managerId });
        if (!updated) {
            throw new NotFoundError('Не удалось обновить заявку');
        }

        return updated;
    }

    async changeStatus(applicationId: number, status: ApplicationStatus): Promise<ApplicationEntity> {
        const application = await this.applicationRepository.findById(applicationId);
        if (!application) {
            throw new NotFoundError('Заявка не найдена');
        }

        const updated = await this.applicationRepository.update(applicationId, { status });
        if (!updated) {
            throw new NotFoundError('Не удалось обновить заявку');
        }

        return updated;
    }

    async createPurchaseFromApplication(
        applicationId: number,
        userId: number,
        price: number
    ): Promise<PurchaseEntity> {
        const application = await this.applicationRepository.findById(applicationId);
        if (!application) {
            throw new NotFoundError('Заявка не найдена');
        }

        if (application.status === 'closed') {
            throw new BadRequestError('Заявка уже закрыта');
        }

        const purchase = await this.purchaseRepository.create({
            purchasePrice: price,
            userId,
            courseId: application.courseId
        });

        await this.changeStatus(applicationId, 'closed');

        return purchase;
    }
}
