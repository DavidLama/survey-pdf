import { IQuestion } from 'survey-core';
import { IRect, DocController } from '../doc_controller';
import { TextBrick } from './pdf_text';

export class TextBoldBrick extends TextBrick {
    public constructor(question: IQuestion, controller: DocController,
        rect: IRect, text: string, fontSize?: number) {
        super(question, controller, rect, text, fontSize);
    }
    public async renderInteractive(): Promise<void> {
        this.controller.fontStyle = 'bold';
        await super.renderInteractive();
        this.controller.fontStyle = 'normal';
    }
}