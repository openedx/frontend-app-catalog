// import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
// import { Card, Badge } from '@openedx/paragon';
// import { Link } from 'react-router-dom';

// const config = {
//   pluginSlots: {
//     'org.openedx.frontend.catalog.course_catalog_page.data_table.course_card': {
//       keepDefault: false,
//       plugins: [
//         {
//           op: PLUGIN_OPERATIONS.Insert,
//           widget: {
//             id: 'custom_course_catalog_page_data_table_course_card_component',
//             type: DIRECT_PLUGIN,
//             RenderWidget: ({
//               isLoading,
//               courseId,
//               courseOrg,
//               courseName,
//               courseNumber,
//               courseImageUrl,
//               courseStartDate,
//               courseAdvertisedStart,
//             }) => {
//               if (isLoading) {
//                 return <Card isLoading />;
//               }

//               if (!courseId) {
//                 return null;
//               }

//               return (
//                 <Card
//                   as={Link}
//                   to={`/courses/${courseId}/about`}
//                   isClickable
//                 >
//                   <Card.Header
//                     title={courseName}
//                     subtitle={
//                       <Badge>{courseOrg}</Badge>
//                     }
//                   />
//                   <Card.Section>
//                     <p className="text-muted font-size-sm">
//                       Course Number: {courseNumber}
//                     </p>
//                   </Card.Section>
//                   <Card.Footer textElement={courseStartDate ? `Starts: ${courseStartDate}` : ''} />
//                 </Card>
//               );
//             },
//           },
//         },
//       ]
//     }
//   },
// }

// export default config;