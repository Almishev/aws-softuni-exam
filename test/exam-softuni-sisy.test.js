"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = __importStar(require("aws-cdk-lib"));
const assertions_1 = require("aws-cdk-lib/assertions");
const ExamSoftuniSisy = __importStar(require("../lib/exam-softuni-sisy-stack"));
describe('ExamSoftuniSisyStack', () => {
    let stack;
    let template;
    beforeEach(() => {
        const app = new cdk.App();
        stack = new ExamSoftuniSisy.ExamSoftuniSisyStack(app, 'MyTestStack');
        template = assertions_1.Template.fromStack(stack);
    });
    test('SNS Topic Created', () => {
        template.hasResourceProperties('AWS::SNS::Topic', {
            DisplayName: 'JSON Processing Notifications',
            TopicName: 'json-processing-notifications'
        });
    });
    test('API Gateway Created', () => {
        template.hasResourceProperties('AWS::ApiGateway::RestApi', {
            Name: 'JSON Processing Service',
            Description: 'API for processing JSON objects'
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhhbS1zb2Z0dW5pLXNpc3kudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImV4YW0tc29mdHVuaS1zaXN5LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUNuQyx1REFBa0Q7QUFDbEQsZ0ZBQWtFO0FBRWxFLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUU7SUFDcEMsSUFBSSxLQUEyQyxDQUFDO0lBQ2hELElBQUksUUFBa0IsQ0FBQztJQUV2QixVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ2QsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDMUIsS0FBSyxHQUFHLElBQUksZUFBZSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNyRSxRQUFRLEdBQUcscUJBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkMsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxFQUFFO1FBQzdCLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxpQkFBaUIsRUFBRTtZQUNoRCxXQUFXLEVBQUUsK0JBQStCO1lBQzVDLFNBQVMsRUFBRSwrQkFBK0I7U0FDM0MsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO1FBQy9CLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQywwQkFBMEIsRUFBRTtZQUN6RCxJQUFJLEVBQUUseUJBQXlCO1lBQy9CLFdBQVcsRUFBRSxpQ0FBaUM7U0FDL0MsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBUZW1wbGF0ZSB9IGZyb20gJ2F3cy1jZGstbGliL2Fzc2VydGlvbnMnO1xuaW1wb3J0ICogYXMgRXhhbVNvZnR1bmlTaXN5IGZyb20gJy4uL2xpYi9leGFtLXNvZnR1bmktc2lzeS1zdGFjayc7XG5cbmRlc2NyaWJlKCdFeGFtU29mdHVuaVNpc3lTdGFjaycsICgpID0+IHtcbiAgbGV0IHN0YWNrOiBFeGFtU29mdHVuaVNpc3kuRXhhbVNvZnR1bmlTaXN5U3RhY2s7XG4gIGxldCB0ZW1wbGF0ZTogVGVtcGxhdGU7XG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbiAgICBzdGFjayA9IG5ldyBFeGFtU29mdHVuaVNpc3kuRXhhbVNvZnR1bmlTaXN5U3RhY2soYXBwLCAnTXlUZXN0U3RhY2snKTtcbiAgICB0ZW1wbGF0ZSA9IFRlbXBsYXRlLmZyb21TdGFjayhzdGFjayk7XG4gIH0pO1xuXG4gIHRlc3QoJ1NOUyBUb3BpYyBDcmVhdGVkJywgKCkgPT4ge1xuICAgIHRlbXBsYXRlLmhhc1Jlc291cmNlUHJvcGVydGllcygnQVdTOjpTTlM6OlRvcGljJywge1xuICAgICAgRGlzcGxheU5hbWU6ICdKU09OIFByb2Nlc3NpbmcgTm90aWZpY2F0aW9ucycsXG4gICAgICBUb3BpY05hbWU6ICdqc29uLXByb2Nlc3Npbmctbm90aWZpY2F0aW9ucydcbiAgICB9KTtcbiAgfSk7XG5cbiAgdGVzdCgnQVBJIEdhdGV3YXkgQ3JlYXRlZCcsICgpID0+IHtcbiAgICB0ZW1wbGF0ZS5oYXNSZXNvdXJjZVByb3BlcnRpZXMoJ0FXUzo6QXBpR2F0ZXdheTo6UmVzdEFwaScsIHtcbiAgICAgIE5hbWU6ICdKU09OIFByb2Nlc3NpbmcgU2VydmljZScsXG4gICAgICBEZXNjcmlwdGlvbjogJ0FQSSBmb3IgcHJvY2Vzc2luZyBKU09OIG9iamVjdHMnXG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=