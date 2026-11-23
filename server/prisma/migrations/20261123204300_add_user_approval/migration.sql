-- AlterTable
ALTER TABLE `users` 
    MODIFY `roleId` INTEGER NULL,
    ADD COLUMN `requestedRole` VARCHAR(191) NULL,
    ADD COLUMN `approvalStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `rejectedAt` DATETIME(3) NULL,
    ADD COLUMN `approvedById` INTEGER NULL,
    ADD COLUMN `rejectionReason` TEXT NULL;

-- CreateIndex
CREATE INDEX `users_approvalStatus_idx` ON `users`(`approvalStatus`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
